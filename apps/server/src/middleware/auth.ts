import { createMiddleware } from 'hono/factory'
import { logger } from './logger'

const SPOTIFY_PROFILE_ENDPOINT = 'https://api.spotify.com/v1/me'

type SpotifyUserProfile = {
  id: string
  display_name: string | null
  email?: string
}

export type AuthVariables = {
  spotifyProfile: SpotifyUserProfile
  spotifyAccessToken: string
}

class SpotifyAuthError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'SpotifyAuthError'
    this.status = status
  }
}

const fetchSpotifyProfile = async (token: string) => {
  let response: Response
  try {
    response = await fetch(SPOTIFY_PROFILE_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  } catch (error) {
    logger.error('Failed to contact Spotify API', { error })
    throw new SpotifyAuthError('Spotify API request failed', 503)
  }

  if (response.status === 401 || response.status === 403) {
    throw new SpotifyAuthError('Spotify token rejected', response.status)
  }

  if (!response.ok) {
    logger.error('Spotify API responded with an error', {
      status: response.status,
      statusText: response.statusText,
    })
    throw new SpotifyAuthError('Spotify API error', response.status)
  }

  return (await response.json()) as SpotifyUserProfile
}

export const authMiddleware = createMiddleware<{ Variables: AuthVariables }>(
  async (c, next) => {
    const authorizationHeader = c.req.header('Authorization')

    if (!authorizationHeader?.startsWith('Bearer ')) {
      logger.warn('No Bearer token in headers')
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const accessToken = authorizationHeader.slice('Bearer '.length).trim()

    if (!accessToken) {
      logger.warn('No Bearer token in headers')
      return c.json({ error: 'Unauthorized' }, 401)
    }

    try {
      const profile = await fetchSpotifyProfile(accessToken)
      c.set('spotifyProfile', profile)
      c.set('spotifyAccessToken', accessToken)
      await next()
    } catch (error) {
      if (error instanceof SpotifyAuthError) {
        if (error.status === 401 || error.status === 403) {
          logger.warn('Spotify token rejected during auth', {
            status: error.status,
          })
          return c.json({ error: 'Unauthorized' }, 401)
        }

        logger.error('Spotify auth middleware failed', {
          status: error.status,
          message: error.message,
        })
        return c.json({ error: 'Spotify service unavailable' }, 502)
      }

      logger.error('Unexpected error during auth middleware', { error })
      return c.json({ error: 'Spotify service unavailable' }, 502)
    }
  },
)

import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'
import { logger } from '~/middleware/logger'

const SPOTIFY_PROFILE_ENDPOINT = 'https://api.spotify.com/v1/me'

type SpotifyUserProfile = {
  id: string
  display_name: string | null
  email?: string
}

export type AuthContext = {
  spotifyProfile: SpotifyUserProfile
  spotifyAccessToken: string
  userEmailOrId: string
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
    logger.error('Failed to contact Spotify API', error)
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

export const authMiddleware = createMiddleware<{ Variables: AuthContext }>(async (c, next) => {
  const authorizationHeader = c.req.header('Authorization')

  if (!authorizationHeader?.startsWith('Bearer ')) {
    logger.warn('No Bearer token in headers')
    throw new HTTPException(401, { message: 'Unauthorized' })
  }

  const accessToken = authorizationHeader.slice('Bearer '.length).trim()

  if (!accessToken) {
    logger.warn('No Bearer token in headers')
    throw new HTTPException(401, { message: 'Unauthorized' })
  }

  try {
    const profile = await fetchSpotifyProfile(accessToken)
    c.set('spotifyProfile', profile)
    c.set('spotifyAccessToken', accessToken)
    c.set('userEmailOrId', profile.email ?? profile.id)
    await next()
  } catch (error) {
    if (error instanceof SpotifyAuthError) {
      if (error.status === 401 || error.status === 403) {
        logger.warn('Spotify token rejected during auth', { status: error.status })
        throw new HTTPException(401, { message: 'Unauthorized' })
      }

      logger.error('Spotify auth middleware failed', error)
      throw new HTTPException(502, { message: 'Spotify service unavailable' })
    }

    logger.error('Unexpected error during auth middleware', error)
    throw new HTTPException(502, { message: 'Spotify service unavailable' })
  }
})

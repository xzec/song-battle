import { AuthError } from '~/auth/AuthError'
import type {
  PkceSession,
  SpotifyTokenResponse,
  SpotifyUserProfile,
  StoredSpotifyTokens,
} from '~/auth/types'

const clientId = 'e17f18f75a0b4a1da45193945c7c39c7'
const redirectUri = 'http://127.0.0.1:3029/callback'
const scope = 'user-read-private user-read-email'
const authUrl = 'https://accounts.spotify.com/authorize'
const tokenUrl = 'https://accounts.spotify.com/api/token'

const pkceStorageKey = 'spotify:pkce:state'
const tokenStorageKey = 'spotify:auth:tokens'
const tokenExpiryBuffer = 60_000

function generateRandomString(length: number) {
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const values = crypto.getRandomValues(new Uint8Array(length))
  return values.reduce((acc, x) => acc + possible[x % possible.length], '')
}

async function sha256(plain: string) {
  const encoder = new TextEncoder()
  const data = encoder.encode(plain)
  return crypto.subtle.digest('SHA-256', data)
}

function base64encode(input: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

function formEncode(input: Record<string, string | number | undefined | null>) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined || value === null) continue
    params.append(key, String(value))
  }
  return params
}

function loadPkceSession() {
  const raw = sessionStorage.getItem(pkceStorageKey)
  if (!raw) return null
  try {
    return JSON.parse(raw) as PkceSession
  } catch (error) {
    console.error('Failed to parse PKCE session', error)
    return null
  }
}

function storePkceSession(session: PkceSession) {
  sessionStorage.setItem(pkceStorageKey, JSON.stringify(session))
}

function clearPkceSession() {
  sessionStorage.removeItem(pkceStorageKey)
}

export function getStoredTokens() {
  const raw = localStorage.getItem(tokenStorageKey)
  if (!raw) return null
  try {
    return JSON.parse(raw) as StoredSpotifyTokens
  } catch (error) {
    console.error('Failed to parse stored tokens', error)
    return null
  }
}

export function storeTokens(tokens: StoredSpotifyTokens) {
  localStorage.setItem(tokenStorageKey, JSON.stringify(tokens))
}

export function clearStoredTokens() {
  localStorage.removeItem(tokenStorageKey)
}

export function tokensAreExpired(tokens: StoredSpotifyTokens) {
  return tokens.expiresAt <= Date.now() + tokenExpiryBuffer
}

export async function beginSpotifyAuth() {
  const codeVerifier = generateRandomString(64)
  const state = generateRandomString(16)
  const hashed = await sha256(codeVerifier)
  const codeChallenge = base64encode(hashed)

  const params = {
    response_type: 'code',
    client_id: clientId,
    scope,
    state,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
    redirect_uri: redirectUri,
  }

  storePkceSession({
    verifier: codeVerifier,
    state,
    createdAt: Date.now(),
    redirectTo: redirectUri,
  })

  const url = new URL(authUrl)
  url.search = new URLSearchParams(params).toString()
  location.href = url.toString()
}

export async function exchangeCodeForTokens(
  code: string,
  verifier: string,
  signal?: AbortSignal,
) {
  try {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formEncode({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        code_verifier: verifier,
      }),
      signal,
    })

    if (!response.ok) {
      const cause = await response.text()
      throw new AuthError('token_exchange_failed', { cause })
    }

    return (await response.json()) as SpotifyTokenResponse
  } catch (error) {
    if (error instanceof AuthError) throw error
    throw new AuthError('network_error', {
      message: 'Network error while exchanging Spotify code for token',
      cause: error,
    })
  }
}

export async function refreshAccessToken(
  refreshToken: string,
  signal?: AbortSignal,
) {
  try {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formEncode({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: clientId,
      }),
      signal,
    })

    if (!response.ok) {
      const cause = await response.text()
      throw new AuthError('refresh_failed', { cause })
    }

    return (await response.json()) as SpotifyTokenResponse
  } catch (error) {
    if (error instanceof AuthError) throw error
    throw new AuthError('network_error', {
      message: 'Network error while refreshing Spotify token',
      cause: error,
    })
  }
}

export function convertToStoredTokens(input: SpotifyTokenResponse) {
  const expiresAt = Date.now() + input.expires_in * 1000
  return {
    accessToken: input.access_token,
    tokenType: input.token_type,
    expiresAt,
    refreshToken: input.refresh_token,
    scope: input.scope ?? scope,
  } satisfies StoredSpotifyTokens
}

export async function fetchSpotifyProfile(
  accessToken: string,
  signal?: AbortSignal,
) {
  const response = await fetch('https://api.spotify.com/v1/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    signal,
  })

  if (!response.ok) {
    const cause = await response.text()
    throw new AuthError('network_error', {
      message: 'Failed to fetch Spotify profile',
      cause,
    })
  }

  return (await response.json()) as SpotifyUserProfile
}

export async function handleSpotifyCallback(
  searchParams: URLSearchParams,
  signal?: AbortSignal,
) {
  const errorParam = searchParams.get('error')
  if (errorParam) {
    clearPkceSession()
    throw new AuthError('callback_error', { cause: errorParam })
  }

  const code = searchParams.get('code')
  const returnedState = searchParams.get('state')
  const session = loadPkceSession()

  if (!session)
    throw new AuthError('token_exchange_failed', {
      message: 'Missing PKCE verifier for Spotify authentication',
      cause: 'session not found',
    })

  if (!code) {
    clearPkceSession()
    throw new AuthError('token_exchange_failed', {
      message: 'Missing authorization code in Spotify callback',
      cause: 'authorization code not found',
    })
  }

  if (session.state !== returnedState) {
    clearPkceSession()
    throw new AuthError('token_exchange_failed', {
      message: 'State mismatch detected during Spotify authentication',
      cause: 'state changed',
    })
  }

  const tokenResponse = await exchangeCodeForTokens(
    code,
    session.verifier,
    signal,
  )
  clearPkceSession()

  return {
    tokens: convertToStoredTokens(tokenResponse),
    redirectTo: session.redirectTo,
  }
}

export function getSpotifyConfig() {
  return {
    clientId: clientId,
    redirectUri: redirectUri,
    scopes: scope,
  }
}

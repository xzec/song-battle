const clientId = 'e17f18f75a0b4a1da45193945c7c39c7'
const redirectUri = 'http://127.0.0.1:3029/callback'
const scope = 'user-read-private user-read-email'
const authUrl = new URL('https://accounts.spotify.com/authorize')
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

function generateState() {
  return generateRandomString(16)
}

type PkceSession = {
  verifier: string
  state: string
  createdAt: number
  redirectTo: string
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

export type SpotifyTokenResponse = {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token?: string
  scope?: string
}

export type StoredSpotifyTokens = {
  accessToken: string
  tokenType: string
  expiresAt: number
  refreshToken?: string
  scope: string
}

export type SpotifyImage = {
  url: string
  height: number | null
  width: number | null
}

export type SpotifyUserProfile = {
  id: string
  display_name: string | null
  email?: string
  images?: SpotifyImage[]
}

export type AuthError = {
  type:
    | 'callback_error'
    | 'state_mismatch'
    | 'missing_verifier'
    | 'token_exchange_failed'
    | 'refresh_failed'
    | 'network_error'
  message: string
  details?: unknown
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

// const buildAuthorizeUrl = ({
//   state,
//   challenge,
// }: {
//   state: string
//   challenge: string
// }) => {
//   const params = new URLSearchParams({
//     client_id: spotifyClientId,
//     response_type: 'code',
//     redirect_uri: spotifyRedirectUri,
//     scope: spotifyScopes.join(' '),
//     state,
//     code_challenge_method: 'S256',
//     code_challenge: challenge,
//   })
//   return `https://accounts.spotify.com/authorize?${params.toString()}`
// }

export async function beginSpotifyAuth() {
  const codeVerifier = generateRandomString(64)
  const state = generateState()
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
  authUrl.search = new URLSearchParams(params).toString()
  location.href = authUrl.toString()
}

function formEncode(input: Record<string, string | number | undefined | null>) {
  const params = new URLSearchParams()
  Object.entries(input).forEach(([key, value]) => {
    if (value === undefined || value === null) return
    params.append(key, String(value))
  })
  return params
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
      const details = await response.text()
      throw {
        type: 'token_exchange_failed',
        message: 'Spotify token exchange failed',
        details,
      } satisfies AuthError
    }

    return (await response.json()) as SpotifyTokenResponse
  } catch (error) {
    if ((error as AuthError)?.type) throw error
    throw {
      type: 'network_error',
      message: 'Network error while exchanging Spotify code',
      details: error,
    } satisfies AuthError
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
      const details = await response.text()
      throw {
        type: 'refresh_failed',
        message: 'Spotify refresh token exchange failed',
        details,
      } satisfies AuthError
    }

    return (await response.json()) as SpotifyTokenResponse
  } catch (error) {
    if ((error as AuthError)?.type) throw error
    throw {
      type: 'network_error',
      message: 'Network error while refreshing Spotify token',
      details: error,
    } satisfies AuthError
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
    const details = await response.text()
    throw {
      type: 'network_error',
      message: 'Failed to fetch Spotify profile',
      details,
    } satisfies AuthError
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

    throw {
      type: 'callback_error',
      message: `Spotify authorization error: ${errorParam}`,
    } satisfies AuthError
  }

  const code = searchParams.get('code')
  const returnedState = searchParams.get('state')
  const session = loadPkceSession()

  if (!session) {
    throw {
      type: 'missing_verifier',
      message: 'Missing PKCE verifier for Spotify authentication',
    } satisfies AuthError
  }

  if (!code) {
    clearPkceSession()
    throw {
      type: 'token_exchange_failed',
      message: 'Missing authorization code in Spotify callback',
    } satisfies AuthError
  }

  if (session.state !== returnedState) {
    clearPkceSession()
    throw {
      type: 'state_mismatch',
      message: 'Spotify state mismatch detected',
    } satisfies AuthError
  }

  const tokenResponse = await exchangeCodeForTokens(
    code,
    session.verifier,
    signal,
  )
  // clearPkceSession()

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

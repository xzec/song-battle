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

type SpotifyImage = {
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

export type AuthErrorType =
  | 'callback_error'
  | 'token_exchange_failed'
  | 'refresh_failed'
  | 'network_error'

export type PkceSession = {
  verifier: string
  state: string
  createdAt: number
  redirectTo: string
}

export type AuthStatus =
  | 'loading'
  | 'unauthenticated'
  | 'authenticating'
  | 'authenticated'
  | 'error'

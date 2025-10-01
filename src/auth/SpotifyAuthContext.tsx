import { createContext, useContext } from 'react'
import type {
  AuthError,
  AuthStatus,
  SpotifyUserProfile,
  StoredSpotifyTokens,
} from '~/auth/types'

export type SpotifyAuthValue = {
  status: AuthStatus
  user: SpotifyUserProfile | null
  tokens: StoredSpotifyTokens | null
  error: AuthError | null
  login: () => void
  logout: () => void
}

export const SpotifyAuthContext = createContext<SpotifyAuthValue | null>(null)

export const useSpotifyAuth = () => {
  const context = useContext(SpotifyAuthContext)
  if (!context)
    throw new Error('useSpotifyAuth must be used within SpotifyAuthProvider')
  return context
}

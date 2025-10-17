import { createContext, useContext } from 'react'
import type { AuthError } from '~/auth/AuthError'
import type {
  AuthStatus,
  SpotifyUserProfile,
  StoredSpotifyTokens,
} from '~/auth/types'

export type SpotifyAuthValue = {
  status: AuthStatus
  user: SpotifyUserProfile | null
  tokens: StoredSpotifyTokens | null
  refreshTokens: () => Promise<void>
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

export const useUser = () => {
  const context = useSpotifyAuth()
  if (!context.user)
    console.error('useUser must be used within authenticated screens.')

  return context.user!
}

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AuthError } from '~/auth/AuthError'
import { SpotifyAuthContext } from '~/auth/SpotifyAuthContext'
import {
  beginSpotifyAuth,
  clearStoredTokens,
  convertToStoredTokens,
  fetchSpotifyProfile,
  getStoredTokens,
  handleSpotifyCallback,
  refreshAccessToken,
  storeTokens,
  tokensAreExpired,
} from '~/auth/spotify'
import type {
  AuthStatus,
  SpotifyUserProfile,
  StoredSpotifyTokens,
} from '~/auth/types'

const callbackPathname = new URL(import.meta.env.VITE_SPOTIFY_REDIRECT_URI)
  .pathname

export const SpotifyAuthProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [tokens, setTokens] = useState<StoredSpotifyTokens | null>(null)
  const [user, setUser] = useState<SpotifyUserProfile | null>(null)
  const [error, setError] = useState<AuthError | null>(null)
  const mountedRef = useRef(false)

  const handleError = useCallback((error: AuthError) => {
    console.error(error)
    setStatus('error')
    setError(error)
    setUser(null)
    clearStoredTokens()
    setTokens(null)
  }, [])

  const handleUnauthenticated = useCallback(() => {
    setStatus('unauthenticated')
    setUser(null)
    setError(null)
    clearStoredTokens()
    setTokens(null)
  }, [])

  useEffect(() => {
    if (mountedRef.current) return
    mountedRef.current = true

    async function applyTokens(nextTokens: StoredSpotifyTokens) {
      setTokens(nextTokens)
      storeTokens(nextTokens)

      try {
        const profile = await fetchSpotifyProfile(nextTokens.accessToken)
        setUser(profile)
        setError(null)
      } catch (profileError) {
        handleError(AuthError.from(profileError))
        return
      }
      setStatus('authenticated')
    }

    async function initialize() {
      if (location.pathname === callbackPathname) {
        setStatus('authenticating')
        const searchParams = new URLSearchParams(location.search)
        try {
          const { tokens } = await handleSpotifyCallback(searchParams)
          await applyTokens(tokens)
        } catch (authError) {
          handleError(AuthError.from(authError))
        } finally {
          history.replaceState(null, '', '/')
        }
        return
      }

      const stored = getStoredTokens()
      if (!stored) {
        handleUnauthenticated()
        return
      }

      if (tokensAreExpired(stored)) {
        if (!stored.refreshToken) {
          handleUnauthenticated()
          return
        }

        setStatus('authenticating')
        let tokens: StoredSpotifyTokens
        try {
          const refreshed = await refreshAccessToken(stored.refreshToken)
          tokens = convertToStoredTokens({
            ...refreshed,
            refresh_token: refreshed.refresh_token ?? stored.refreshToken,
          })
        } catch (refreshError) {
          handleError(AuthError.from(refreshError, 'refresh_failed'))
          return
        }
        await applyTokens(tokens)
        return
      }

      setStatus('authenticating')
      await applyTokens(stored)
    }

    void initialize()
  }, [handleError, handleUnauthenticated])

  const login = useCallback(() => {
    setStatus('authenticating')
    setUser(null)
    setError(null)

    void beginSpotifyAuth().catch((authError) => {
      setStatus('error')
      setError(AuthError.from(authError))
    })
  }, [])

  const logout = handleUnauthenticated

  const value = useMemo(
    () => ({
      status,
      user,
      tokens,
      error,
      login,
      logout,
    }),
    [status, user, tokens, error, login, logout],
  )

  return <SpotifyAuthContext value={value}>{children}</SpotifyAuthContext>
}

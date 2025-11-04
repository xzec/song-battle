import { useCallback, useEffect, useRef, useState } from 'react'
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
import { useBackgroundTokenRefresh } from '~/auth/useBackgroundTokenRefresh'

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

  const applyTokens = useCallback(
    async (nextTokens: StoredSpotifyTokens) => {
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
    },
    [handleError],
  )

  const refreshTokens = useCallback(async () => {
    const stored = getStoredTokens()
    if (!stored?.refreshToken) {
      handleUnauthenticated()
      return
    }

    let nextTokens: StoredSpotifyTokens
    try {
      const refreshed = await refreshAccessToken(stored.refreshToken)
      nextTokens = convertToStoredTokens({
        ...refreshed,
        refresh_token: refreshed.refresh_token ?? stored.refreshToken,
      })
    } catch (refreshError) {
      const error = AuthError.from(refreshError)
      // ignore network errors when offline, `useBackgroundTokenRefresh` will attempt to refresh when back online
      if (error.type === 'network_error' && !navigator.onLine) return
      handleError(error)
      return
    }

    await applyTokens(nextTokens)
  }, [applyTokens, handleError, handleUnauthenticated])

  useEffect(
    function authenticate() {
      if (mountedRef.current) return
      mountedRef.current = true

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

        setStatus('authenticating')
        if (tokensAreExpired(stored)) {
          await refreshTokens()
        } else {
          await applyTokens(stored)
        }
      }

      void initialize()
    },
    [handleError, handleUnauthenticated, applyTokens, refreshTokens],
  )

  useBackgroundTokenRefresh(tokens, refreshTokens)

  const login = () => {
    setStatus('authenticating')
    setUser(null)
    setError(null)

    void beginSpotifyAuth().catch((authError) => {
      setStatus('error')
      setError(AuthError.from(authError))
    })
  }

  const logout = handleUnauthenticated

  const value = {
    status,
    user,
    tokens,
    error,
    login,
    logout,
  }

  return <SpotifyAuthContext value={value}>{children}</SpotifyAuthContext>
}

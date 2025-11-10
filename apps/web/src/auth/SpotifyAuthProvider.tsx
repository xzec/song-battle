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
import type { AuthStatus, SpotifyUserProfile, StoredSpotifyTokens } from '~/auth/types'
import { useBackgroundTokenRefresh } from '~/auth/useBackgroundTokenRefresh'
import { asyncRetry } from '~/utils/async-retry'

const refreshAccessTokenWithRetry = asyncRetry(refreshAccessToken, 2)
const callbackPathname = new URL(import.meta.env.VITE_SPOTIFY_REDIRECT_URI).pathname

export function SpotifyAuthProvider({ children }: React.PropsWithChildren) {
  const [status, setStatus] = useState<AuthStatus>('authenticating')
  const [tokens, setTokens] = useState<StoredSpotifyTokens | null>(null) // TODO init tokens here
  const [user, setUser] = useState<SpotifyUserProfile | null>(null)
  const [error, setError] = useState<AuthError | null>(null)
  const mountedRef = useRef(false)
  const refreshTokenInProgress = useRef(false)

  const handleError = useCallback((error: AuthError) => {
    console.error(error)
    setStatus('error')
    setError(error)
    setUser(null)
    clearStoredTokens()
    setTokens(null)
  }, [])

  const handleLoadError = useCallback((error: AuthError) => {
    console.error(error)
    setStatus('error')
    setError(error)
    setUser(null)
    // clearStoredTokens()
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

  const loadUserProfile = useCallback(
    async (accessToken: string) => {
      try {
        const profile = await fetchSpotifyProfile(accessToken)
        setUser(profile)
        setError(null)
      } catch (profileError) {
        handleLoadError(AuthError.from(profileError))
        return
      }
    },
    [handleLoadError],
  )

  const refreshTokens = useCallback(async () => {
    if (refreshTokenInProgress.current) return
    refreshTokenInProgress.current = true

    const refreshToken = getStoredTokens()?.refreshToken
    if (!refreshToken) {
      handleUnauthenticated()
      return
    }

    let nextTokens: StoredSpotifyTokens
    try {
      const refreshed = await refreshAccessTokenWithRetry(refreshToken)
      nextTokens = convertToStoredTokens({
        ...refreshed,
        refresh_token: refreshed.refresh_token ?? refreshToken,
      })
    } catch (refreshError) {
      const error = AuthError.from(refreshError)
      // ignore network errors when offline, `useBackgroundTokenRefresh` will attempt to refresh when back online
      if (error.type === 'network_error' && !navigator.onLine) return
      handleError(error)
      return
    } finally {
      refreshTokenInProgress.current = false
    }

    await applyTokens(nextTokens)
  }, [applyTokens, handleError, handleUnauthenticated])

  useEffect(
    function authenticate() {
      if (mountedRef.current) return
      mountedRef.current = true

      async function initialize() {
        setStatus('authenticating')
        if (location.pathname === callbackPathname) {
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
          await refreshTokens()
        } else {
          setTokens(stored)
          await loadUserProfile(stored.accessToken)
          setStatus('authenticated')
        }
      }

      void initialize()
    },
    [handleError, handleUnauthenticated, applyTokens, refreshTokens, loadUserProfile],
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

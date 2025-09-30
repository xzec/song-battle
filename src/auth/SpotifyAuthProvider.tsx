import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  type AuthStatus,
  SpotifyAuthContext,
} from '~/auth/SpotifyAuthContext.tsx'
import {
  type AuthError,
  beginSpotifyAuth,
  clearStoredTokens,
  convertToStoredTokens,
  fetchSpotifyProfile,
  getSpotifyConfig,
  getStoredTokens,
  handleSpotifyCallback,
  refreshAccessToken,
  type SpotifyUserProfile,
  type StoredSpotifyTokens,
  storeTokens,
  tokensAreExpired,
} from '~/auth/spotify'

const { redirectUri } = getSpotifyConfig()
const callbackPathname = new URL(redirectUri).pathname

export const SpotifyAuthProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [tokens, setTokens] = useState<StoredSpotifyTokens | null>(null)
  const [user, setUser] = useState<SpotifyUserProfile | null>(null)
  const [error, setError] = useState<AuthError | null>(null)

  const replaceHistory = useCallback((target: string) => {
    window.history.replaceState(null, '', target)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const signal = controller.signal

    async function applyTokens(nextTokens: StoredSpotifyTokens) {
      setTokens(nextTokens)
      storeTokens(nextTokens)

      try {
        const profile = await fetchSpotifyProfile(
          nextTokens.accessToken,
          signal,
        )
        if (signal.aborted) return
        setUser(profile)
        setError(null)
      } catch (profileError) {
        if (signal.aborted) return
        setUser(null)
        setStatus('error')
        setError(profileError as AuthError)
      }
      if (!signal.aborted) setStatus('authenticated')
    }

    async function initialize() {
      if (window.location.pathname === callbackPathname) {
        setStatus('authenticating')
        const searchParams = new URLSearchParams(location.search)
        try {
          const { tokens: callbackTokens } = await handleSpotifyCallback(
            searchParams,
            signal,
          )
          if (signal.aborted) return
          await applyTokens(callbackTokens)
          if (signal.aborted) return
        } catch (authError) {
          if (signal.aborted) return
          setTokens(null)
          clearStoredTokens()
          setStatus('error')
          setError(authError as AuthError)
        } finally {
          replaceHistory('/')
        }
        return
      }

      const stored = getStoredTokens()
      if (!stored) {
        setStatus('unauthenticated')
        setTokens(null)
        setUser(null)
        setError(null)
        return
      }

      if (tokensAreExpired(stored)) {
        if (!stored.refreshToken) {
          clearStoredTokens()
          setTokens(null)
          setUser(null)
          setStatus('unauthenticated')
          setError(null)
          return
        }

        setStatus('authenticating')
        try {
          const refreshed = await refreshAccessToken(
            stored.refreshToken,
            signal,
          )
          if (signal.aborted) return
          const normalized = convertToStoredTokens({
            ...refreshed,
            refresh_token: refreshed.refresh_token ?? stored.refreshToken,
          })
          await applyTokens(normalized)
        } catch (refreshError) {
          if (signal.aborted) return
          clearStoredTokens()
          setTokens(null)
          setUser(null)
          setStatus('unauthenticated')
          setError(refreshError as AuthError)
        }
        return
      }

      setStatus('authenticating')
      await applyTokens(stored)
    }

    void initialize()

    return () => {
      controller.abort()
      setStatus('loading')
      setTokens(null)
      setUser(null)
      setError(null)
    }
  }, [replaceHistory])

  const login = useCallback(() => {
    setStatus('authenticating')
    setError(null)
    setUser(null)
    void beginSpotifyAuth().catch((authError) => {
      setStatus('error')
      setError(authError as AuthError)
    })
  }, [])

  const logout = useCallback(() => {
    clearStoredTokens()
    setTokens(null)
    setUser(null)
    setStatus('unauthenticated')
    setError(null)
  }, [])

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

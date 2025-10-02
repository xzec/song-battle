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
        console.error(profileError)
        setUser(null)
        setStatus('error')
        setError(AuthError.from(profileError))
      }
      setStatus('authenticated')
    }

    async function initialize() {
      if (window.location.pathname === callbackPathname) {
        setStatus('authenticating')
        const searchParams = new URLSearchParams(location.search)
        try {
          const { tokens } = await handleSpotifyCallback(searchParams)
          await applyTokens(tokens)
        } catch (authError) {
          console.error(authError)
          setTokens(null)
          clearStoredTokens()
          setStatus('error')
          setError(AuthError.from(authError))
        } finally {
          history.replaceState(null, '', '/')
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
          const refreshed = await refreshAccessToken(stored.refreshToken)
          const normalized = convertToStoredTokens({
            ...refreshed,
            refresh_token: refreshed.refresh_token ?? stored.refreshToken,
          })
          await applyTokens(normalized)
        } catch (refreshError) {
          console.error(refreshError)
          clearStoredTokens()
          setStatus('unauthenticated')
          setTokens(null)
          setUser(null)
          setError(AuthError.from(refreshError, 'refresh_failed'))
        }
        return
      }

      setStatus('authenticating')
      await applyTokens(stored)
    }

    void initialize()
  }, [])

  const login = useCallback(() => {
    setStatus('authenticating')
    setError(null)
    setUser(null)

    void beginSpotifyAuth().catch((authError) => {
      setStatus('error')
      setError(AuthError.from(authError))
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

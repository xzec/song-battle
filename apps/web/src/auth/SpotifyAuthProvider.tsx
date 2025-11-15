import { useCallback, useEffect, useReducer, useRef } from 'react'
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

type State = {
  status: AuthStatus
  tokens: StoredSpotifyTokens | null
  user: SpotifyUserProfile | null
  error: AuthError | null
}

const initialState = {
  status: 'authenticating',
  tokens: null,
  user: null,
  error: null,
} as const satisfies State

type ACTION_TYPE =
  | { type: 'error'; error: AuthError }
  | { type: 'unauthenticate' }
  | { type: 'set-tokens'; tokens: StoredSpotifyTokens }
  | { type: 'set-user'; user: SpotifyUserProfile }
  | { type: 'start-auth' }
  | { type: 'set-authenticated' }

function reducer(state: State, action: ACTION_TYPE): State {
  switch (action.type) {
    case 'error':
      return { status: 'error', tokens: null, user: null, error: action.error }
    case 'unauthenticate':
      return { status: 'unauthenticated', tokens: null, user: null, error: null }
    case 'set-tokens':
      return { ...state, tokens: action.tokens }
    case 'set-user':
      return { ...state, user: action.user }
    case 'start-auth':
      return { ...state, status: 'authenticating', user: null, error: null }
    case 'set-authenticated':
      return { ...state, status: 'authenticated' }
    default:
      throw new Error('Unhandled action type in Auth reducer.')
  }
}

export function SpotifyAuthProvider({ children }: React.PropsWithChildren) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const mountedRef = useRef(false)
  const refreshTokenInProgress = useRef(false)

  const handleError = useCallback((error: AuthError) => {
    clearStoredTokens()
    dispatch({ type: 'error', error })
  }, [])

  const loadUserProfile = useCallback(
    async (accessToken: string) => {
      try {
        const profile = await fetchSpotifyProfile(accessToken)
        dispatch({ type: 'set-user', user: profile })
      } catch (profileError) {
        handleError(AuthError.from(profileError))
        return
      }
    },
    [handleError],
  )

  const refreshTokens = useCallback(async () => {
    if (refreshTokenInProgress.current) return
    refreshTokenInProgress.current = true

    const refreshToken = getStoredTokens()?.refreshToken
    if (!refreshToken) {
      logout()
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

    storeTokens(nextTokens)
    dispatch({ type: 'set-tokens', tokens: nextTokens })
    await loadUserProfile(nextTokens.accessToken)
  }, [handleError, loadUserProfile])

  useEffect(
    function authenticate() {
      if (mountedRef.current) return
      mountedRef.current = true

      async function initialize() {
        dispatch({ type: 'start-auth' })
        // 1) handle /callback path during OAuth
        if (location.pathname === callbackPathname) {
          const searchParams = new URLSearchParams(location.search)
          try {
            const { tokens } = await handleSpotifyCallback(searchParams)
            storeTokens(tokens)
            dispatch({ type: 'set-tokens', tokens })
            await loadUserProfile(tokens.accessToken)
            dispatch({ type: 'set-authenticated' })
          } catch (authError) {
            handleError(AuthError.from(authError))
          } finally {
            history.replaceState(null, '', '/')
          }
          return
        }

        // 2) load stored tokens
        const stored = getStoredTokens()
        if (!stored) {
          logout()
          return
        }
        if (tokensAreExpired(stored)) {
          await refreshTokens()
        } else {
          dispatch({ type: 'set-tokens', tokens: stored })
          await loadUserProfile(stored.accessToken)
        }

        dispatch({ type: 'set-authenticated' })
      }

      void initialize()
    },
    [refreshTokens, loadUserProfile, handleError],
  )

  useBackgroundTokenRefresh(state.tokens, refreshTokens)

  const login = () => {
    dispatch({ type: 'start-auth' })
    void beginSpotifyAuth().catch((authError) => handleError(AuthError.from(authError)))
  }

  const logout = () => {
    clearStoredTokens()
    dispatch({ type: 'unauthenticate' })
  }

  const value = {
    ...state,
    login,
    logout,
  }

  return <SpotifyAuthContext value={value}>{children}</SpotifyAuthContext>
}

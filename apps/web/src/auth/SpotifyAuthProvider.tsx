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
  | { type: 'store-tokens'; tokens: StoredSpotifyTokens }
  | { type: 'reuse-tokens'; tokens: StoredSpotifyTokens }
  | { type: 'set-user'; user: SpotifyUserProfile }
  | { type: 'start-auth' }
  | { type: 'set-authenticated' }

function reducer(state: State, action: ACTION_TYPE): State {
  switch (action.type) {
    case 'error':
      clearStoredTokens()
      return { status: 'error', tokens: null, user: null, error: action.error }
    case 'unauthenticate':
      clearStoredTokens()
      return { status: 'unauthenticated', tokens: null, user: null, error: null }
    case 'store-tokens':
      storeTokens(action.tokens)
      return { ...state, tokens: action.tokens }
    case 'reuse-tokens':
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

  const loadUserProfile = useCallback(async (accessToken: string) => {
    try {
      const profile = await fetchSpotifyProfile(accessToken)
      dispatch({ type: 'set-user', user: profile })
    } catch (profileError) {
      dispatch({ type: 'error', error: AuthError.from(profileError) })
      return
    }
  }, [])

  const refreshTokens = useCallback(async () => {
    if (refreshTokenInProgress.current) return
    refreshTokenInProgress.current = true

    const refreshToken = getStoredTokens()?.refreshToken
    if (!refreshToken) {
      dispatch({ type: 'unauthenticate' })
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

      dispatch({ type: 'error', error })
      return
    } finally {
      refreshTokenInProgress.current = false
    }

    dispatch({ type: 'store-tokens', tokens: nextTokens })
    await loadUserProfile(nextTokens.accessToken)
  }, [loadUserProfile])

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
            dispatch({ type: 'store-tokens', tokens })
            await loadUserProfile(tokens.accessToken)
            dispatch({ type: 'set-authenticated' })
          } catch (authError) {
            dispatch({ type: 'error', error: AuthError.from(authError) })
          } finally {
            history.replaceState(null, '', '/')
          }
          return
        }

        // 2) load stored tokens
        const stored = getStoredTokens()
        if (!stored) {
          dispatch({ type: 'unauthenticate' })
          return
        }
        if (tokensAreExpired(stored)) {
          await refreshTokens()
        } else {
          dispatch({ type: 'reuse-tokens', tokens: stored })
          await loadUserProfile(stored.accessToken)
        }

        dispatch({ type: 'set-authenticated' })
      }

      void initialize()
    },
    [refreshTokens, loadUserProfile],
  )

  useBackgroundTokenRefresh(state.tokens, refreshTokens)

  const login = () => {
    dispatch({ type: 'start-auth' })

    void beginSpotifyAuth().catch((authError) => {
      dispatch({ type: 'error', error: AuthError.from(authError) })
    })
  }

  const logout = () => dispatch({ type: 'unauthenticate' })

  const value = {
    ...state,
    login,
    logout,
  }

  return <SpotifyAuthContext value={value}>{children}</SpotifyAuthContext>
}

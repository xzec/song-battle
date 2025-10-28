import { useEffect } from 'react'
import { tokenExpiryBuffer, tokensAreExpired } from '~/auth/spotify'
import type { StoredSpotifyTokens } from '~/auth/types'

export function useBackgroundTokenRefresh(
  tokens: StoredSpotifyTokens | null,
  refreshTokens: () => Promise<void>,
) {
  // event refresh
  useEffect(() => {
    async function refreshIfExpired() {
      if (tokens && tokensAreExpired(tokens)) await refreshTokens()
    }

    window.addEventListener('online', refreshIfExpired)
    window.addEventListener('focus', refreshIfExpired)
    document.addEventListener('visibilitychange', refreshIfExpired)

    return () => {
      window.removeEventListener('online', refreshIfExpired)
      window.removeEventListener('focus', refreshIfExpired)
      document.removeEventListener('visibilitychange', refreshIfExpired)
    }
  }, [refreshTokens, tokens])

  // timer refresh
  useEffect(() => {
    if (!tokens) return

    const timeoutId = setTimeout(
      () => void refreshTokens(),
      tokens.expiresAt - Date.now() - tokenExpiryBuffer,
    )

    return () => {
      if (timeoutId !== undefined) clearTimeout(timeoutId)
    }
  }, [refreshTokens, tokens])
}

import { useEffect, useEffectEvent } from 'react'
import { tokenExpiryBuffer, tokensAreExpired } from '~/auth/spotify'
import type { StoredSpotifyTokens } from '~/auth/types'

export function useBackgroundTokenRefresh(tokens: StoredSpotifyTokens | null, refreshTokens: () => Promise<void>) {
  const attemptRefresh = useEffectEvent(refreshTokens)

  const refreshIfExpired = useEffectEvent(async () => {
    if (tokensAreExpired(tokens!)) await refreshTokens()
  })

  // event refresh
  useEffect(() => {
    if (!tokens) return

    window.addEventListener('online', refreshIfExpired)
    window.addEventListener('focus', refreshIfExpired)
    document.addEventListener('visibilitychange', refreshIfExpired)

    return () => {
      window.removeEventListener('online', refreshIfExpired)
      window.removeEventListener('focus', refreshIfExpired)
      document.removeEventListener('visibilitychange', refreshIfExpired)
    }
  }, [tokens])

  // timer refresh
  useEffect(() => {
    if (!tokens) return

    const timeoutId = setTimeout(() => void attemptRefresh(), tokens.expiresAt - Date.now() - tokenExpiryBuffer)

    return () => {
      if (timeoutId !== undefined) clearTimeout(timeoutId)
    }
  }, [tokens])
}

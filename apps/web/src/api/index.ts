import type { Track } from '~/context/types'

export async function storeSong(track: Track, accessToken: string) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/store`, {
    method: 'POST',
    body: JSON.stringify(track),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  })
  const parsed = await res.json()
  console.log(parsed)
  return parsed
}

export async function getStoredSongs(accessToken: string) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/store`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
  const parsed = (await res.json()) as { message: 'string'; items: Track[] }
  console.log(parsed)
  return parsed.items
}

export async function deleteStoredSong(trackId: string, accessToken: string) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/store`, {
    method: 'PATCH',
    body: JSON.stringify({ id: trackId }),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  })
  const parsed = await res.json()
  console.log(parsed)
  return parsed
}

export async function hitSearch(
  query: string,
  accessToken: string,
  refreshTokens: () => Promise<void>,
) {
  const params = new URLSearchParams({
    q: query,
    type: 'track',
    market: 'US',
    limit: '10',
  })

  const url = `https://api.spotify.com/v1/search?${params.toString()}`

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!res.ok) {
    const parsed = (await res.json()) as SpotifyTrackSearchError
    console.error(parsed)
    if (parsed.error.status === 401) void refreshTokens()
  }

  const data = await res.json()
  return data as SpotifyTrackSearchResponse
}

type SpotifyTrackSearchResponse = {
  tracks: {
    items: Array<{
      id: string
      name: string
      artists: Array<{
        name: string
      }>
      album: {
        images: Array<{
          url: string
        }>
      }
    }>
  }
}

type SpotifyTrackSearchError = {
  error: {
    status: number
    message: string
  }
}

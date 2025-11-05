import type { Track } from '~/context/types'

const searchUrl = 'https://api.spotify.com/v1/search'

export async function searchTracks(query: string, accessToken: string, country: string, signal?: AbortSignal) {
  if (!query || signal?.aborted) return []

  const params = {
    q: query,
    type: 'track',
    limit: '10',
    market: country,
  }

  const url = new URL(searchUrl)
  url.search = new URLSearchParams(params).toString()

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    signal,
  })

  if (!res.ok) {
    const error = (await res.json()) as SpotifyTrackSearchError
    throw new Error(error.error.message, { cause: error })
  }

  const data = (await res.json()) as SpotifyTrackSearchResponse

  return data.tracks.items.map<Track>((track) => ({
    id: track.id,
    name: track.name,
    artist: track.artists.map((v) => v.name).join(', '),
    image: track.album.images.at(-2)?.url,
    imagePreview: track.album.images.at(-1)?.url,
  }))
}

interface SpotifyTrackSearchResponse {
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

interface SpotifyTrackSearchError {
  error: {
    status: number
    message: string
  }
}

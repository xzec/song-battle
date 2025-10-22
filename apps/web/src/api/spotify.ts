const searchUrl = 'https://api.spotify.com/v1/search'

export async function hitSearch(
  query: string,
  accessToken: string,
  country: string,
) {
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
  })

  if (!res.ok) {
    const parsed = (await res.json()) as SpotifyTrackSearchError
    console.error(parsed)
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

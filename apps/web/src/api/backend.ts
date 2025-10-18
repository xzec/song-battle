import type { Track } from '~/context/types'

export async function storeSong(
  track: Track,
  accessToken: string,
): Promise<{ message: 'string' }> {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/store`, {
    method: 'POST',
    body: JSON.stringify(track),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  })
  return res.json()
}

export async function getStoredSongs(accessToken: string) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/store`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
  const parsed = (await res.json()) as { message: 'string'; items: Track[] }
  return parsed.items
}

export async function deleteStoredSong(
  trackId: string,
  accessToken: string,
): Promise<{ message: 'string' }> {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/store`, {
    method: 'PATCH',
    body: JSON.stringify({ id: trackId }),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  })
  return res.json()
}

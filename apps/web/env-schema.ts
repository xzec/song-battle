import { z } from 'zod'

export const envSchema = z.object({
  VITE_SPOTIFY_CLIENT_ID: z
    .string()
    .min(1)
    .describe('As found in Spotify Developer Dashboard.'),
  VITE_SPOTIFY_REDIRECT_URI: z
    .url()
    .describe(
      'Redirect URI for the Spotify App. Must be registered in Spotify Developer Dashboard.',
    ),
  VITE_API_URL: z.url().describe('URL of the tiny Hono backend.'),
})

export type EnvSchema = z.infer<typeof envSchema>

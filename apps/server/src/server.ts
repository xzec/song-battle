import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { etag } from 'hono/etag'
import { HTTPException } from 'hono/http-exception'
import { timeout } from 'hono/timeout'
import { type AuthContext, authMiddleware } from '~/middleware/auth'
import { logger, loggerMiddleware } from '~/middleware/logger'
import { type RedisContext, redisMiddleware } from '~/middleware/redis'
import { createRedis } from '~/service/redis'
import type { Track } from '~/types'

const app = new Hono<{ Variables: AuthContext & RedisContext }>()
const redis = await createRedis()

app.get('/favicon.ico', (c) => c.body(null, 204))

app.use('*', loggerMiddleware)
app.use(cors())
app.use('*', authMiddleware)
app.use('*', redisMiddleware(redis))

app.get('/store', etag())
app.use(
  '/store',
  timeout(5_000, () => new HTTPException(408, { message: `Request timed out. Please try again later.` })),
)

app.get('/', (c) => {
  const profile = c.get('spotifyProfile')

  return c.json({ message: 'Authenticated', profile })
})

app.post('/store', async (c) => {
  const profile = c.get('spotifyProfile')
  const email = profile.email
  if (!email) throw new HTTPException(400, { message: 'No email found' })

  const key = `user:${email}`
  const track = await c.req.text()

  const redis = c.get('redis')
  await redis.multi().lRem(key, 0, track).lPush(key, track).lTrim(key, 0, 4).exec()

  return c.json({ message: 'success' }, 201)
})

app.get('/store', async (c) => {
  await new Promise((resolve) => setTimeout(resolve, 5_500))
  const profile = c.get('spotifyProfile')
  const email = profile.email

  if (!email) throw new HTTPException(400, { message: 'No email found' })

  const redis = c.get('redis')
  const raw = await redis.lRange(`user:${email}`, 0, -1)

  const headers = {
    'Cache-Control': 'private, no-cache',
    Vary: 'Authorization',
  }

  const items = raw.map((item) => JSON.parse(item) as Track)

  return c.json({ message: 'success', items }, 200, headers)
})

app.patch('/store', async (c) => {
  const profile = c.get('spotifyProfile')
  const email = profile.email
  if (!email) throw new HTTPException(400, { message: 'No email found' })

  const req = await c.req.json<{ id: string }>()
  const id = req.id
  if (!id) throw new HTTPException(400, { message: 'No id received' })

  const key = `user:${email}`

  const redis = c.get('redis')
  const raw = await redis.lRange(key, 0, -1)
  const filtered = raw.filter((item) => (JSON.parse(item) as Track).id !== id)

  if (!filtered.length) {
    await redis.del(key)
  } else {
    await redis.multi().del(key).rPush(key, filtered).exec()
  }

  return c.json({ message: 'success' })
})

app.onError((error, c) => {
  logger.error('App caught top-level error:', error)
  if (error instanceof HTTPException) return c.text(error.message, error.status)
  return c.text('Internal Server Error', 500)
})

async function shutdown() {
  logger.info('Initiated shutdown sequence')
  try {
    redis.destroy()
  } catch {
    logger.error('Failed to destroy Redis client')
  }
  process.exit(1)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
process.on('uncaughtException', shutdown)
process.on('unhandledRejection', shutdown)

serve(
  {
    fetch: app.fetch,
    port: 3044,
  },
  (info) => console.log(`Server is running on http://localhost:${info.port}`),
)

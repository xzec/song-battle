import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { etag } from 'hono/etag'
import { HTTPException } from 'hono/http-exception'
import { type AuthVariables, authMiddleware } from '~/middleware/auth'
import { loggerMiddleware } from '~/middleware/logger'
import createRedis from '~/redis'
import type { Track } from '~/types'

const redis = await createRedis()
const app = new Hono<{ Variables: AuthVariables }>()

app.get('/favicon.ico', (c) => c.body(null, 204))

app.use('*', cors())
app.use('*', loggerMiddleware)
app.use('*', authMiddleware)
app.use('/store', etag())

app.get('/', (c) => {
  const profile = c.get('spotifyProfile')

  return c.json({
    message: 'Authenticated',
    profile,
  })
})

app.post('/store', async (c) => {
  const profile = c.get('spotifyProfile')
  const email = profile.email
  if (!email) throw new HTTPException(400, { message: 'No email found' })

  const key = `user:${email}`
  const track = await c.req.text()

  await redis.multi().lRem(key, 0, track).lPush(key, track).lTrim(key, 0, 4).exec()

  return c.json({ message: 'success' }, 201)
})

app.get('/store', async (c) => {
  const profile = c.get('spotifyProfile')
  const email = profile.email
  if (!email) throw new HTTPException(400, { message: 'No email found' })

  const raw = await redis.lRange(`user:${email}`, 0, -1)

  const headers = {
    'Cache-Control': 'private, no-cache',
    Vary: 'Authorization',
  }

  const items = raw.map((item) => JSON.parse(item) as Track)

  return c.json(
    {
      message: 'success',
      items,
    },
    200,
    headers,
  )
})

app.patch('/store', async (c) => {
  const profile = c.get('spotifyProfile')
  const email = profile.email
  if (!email) throw new HTTPException(400, { message: 'No email found' })

  const req = await c.req.json<{ id: string }>()
  const id = req.id
  if (!id) throw new HTTPException(400, { message: 'No id received' })

  const key = `user:${email}`

  const raw = await redis.lRange(key, 0, -1)
  const filtered = raw.filter((item) => (JSON.parse(item) as Track).id !== id)

  if (!filtered.length) {
    await redis.del(key)
  } else {
    await redis.multi().del(key).rPush(key, filtered).exec()
  }

  return c.json({ message: 'success' })
})

serve(
  {
    fetch: app.fetch,
    port: 3044,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`)
  },
)

import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { type AuthVariables, authMiddleware } from './middleware/auth'
import { loggerMiddleware } from './middleware/logger'

const app = new Hono<{ Variables: AuthVariables }>()

app.get('/favicon.ico', (c) => c.body(null, 204))
app.use('*', loggerMiddleware)
app.use('*', authMiddleware)

app.get('/', (c) => {
  const profile = c.get('spotifyProfile')

  return c.json({
    message: 'Hello Hono!',
    profile,
  })
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

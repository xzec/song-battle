import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'
import type { Redis } from '~/service/redis'

export const redisMiddleware = (redis: Redis) =>
  createMiddleware(async (c, next) => {
    if (!redis) throw new HTTPException(500, { message: 'Internal server error' })

    c.set('redis', redis)
    await next()
  })

export type RedisContext = {
  redis: Redis
}

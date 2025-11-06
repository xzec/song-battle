import { createClient } from 'redis'
import { logger } from '~/middleware/logger'

export type Redis = Awaited<ReturnType<typeof createClient>>

export async function createRedis() {
  const maxAttempts = 3

  const client = createClient({
    url: 'redis://localhost:6379',
    socket: {
      reconnectStrategy: function exponentialBackoffWithMaxAttempts(attempt, error) {
        logger.verbose(`Redis reconnecting (attempt ${attempt + 1}/${maxAttempts})`)
        logger.warn(`Redis failed to reconnect (attempt ${attempt + 1}/${maxAttempts}`, error)
        if (attempt + 1 === maxAttempts) return error

        return 2 ** attempt * 1_000
      },
    },
  })

  client.on('connect', () => logger.verbose('Redis connecting…'))
  client.on('ready', async () => logger.verbose('Redis connected'))
  client.on('error', (error) => logger.error('Redis error', error))

  try {
    await client.connect()
  } catch (error) {
    logger.error('Initial connection to Redis failed:', error)
    process.exit(1)
  }

  return client
}

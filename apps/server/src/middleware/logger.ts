import { createMiddleware } from 'hono/factory'
import { createLogger, format, transports } from 'winston'

const consoleTransport = new transports.Console({
  format: format.combine(
    format.colorize({ all: true }),
    format.timestamp(),
    format.printf(({ level, message, timestamp, ...meta }) => {
      const serializedMeta = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : ''
      return `${timestamp ?? ''} ${level}: ${message as string}${serializedMeta}`
    }),
  ),
})

export const logger = createLogger({
  level: process.env.LOG_LEVEL ?? 'info',
  format: format.combine(
    format.errors({ stack: true }),
    format.splat(),
  ),
  transports: [consoleTransport],
})

export const loggerMiddleware = createMiddleware(async (c, next) => {
  const start = Date.now()
  const { method } = c.req
  const url = c.req.url

  logger.info('Incoming request', { method, url })

  try {
    await next()
    const duration = Date.now() - start
    const { status } = c.res

    logger.info('Request completed', { method, url, status, durationMs: duration })
  } catch (error) {
    const duration = Date.now() - start
    logger.error('Request failed', {
      method,
      url,
      durationMs: duration,
      error,
    })
    throw error
  }
})

// TODO write tests
export function asyncRetry<TArgs extends any[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  retries: number,
  baseWait = 1000,
) {
  if (retries <= 0) throw new Error('retries must be greater than 0')
  if (baseWait <= 0) throw new Error('baseWait must be greater than 0')

  return async function (...args: TArgs) {
    for (let i = 0; i <= retries; i++) {
      if (i > 0) {
        await new Promise((resolve) => setTimeout(resolve, 2 ** i * baseWait))
      }

      try {
        return await fn(...args)
      } catch (error) {
        if (i === retries) throw error
      }
    }

    throw new Error('All retries failed')
  }
}

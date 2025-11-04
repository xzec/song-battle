export function debounce<TArgs extends any[], TReturn>(
  fn: (...args: TArgs) => TReturn | Promise<TReturn>,
  wait: number,
) {
  return async function (...args: TArgs) {
    await new Promise((resolve) => setTimeout(resolve, wait))
    return fn(...args)
  }
}

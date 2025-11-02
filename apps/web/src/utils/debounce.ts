export async function debounce<T>(
  fn: () => T | Promise<T>,
  wait: number,
): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, wait))
  return fn()
}

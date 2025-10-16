export function toArrayPairs<T>(array: T[]) {
  return array.reduce<T[][]>((acc, curr, index) => {
    const i = Math.floor(index / 2)
    if (Array.isArray(acc[i])) acc[i].push(curr)
    else acc[i] = [curr]
    return acc
  }, [])
}

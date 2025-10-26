/**
 * Removes null and undefined values from an object
 * @template T - Type extending Record<string, unknown>
 * @param {T} obj - The object to remove empty values from
 * @returns {NonEmpty<T>} A new object with null and undefined values removed
 */
export function removeEmpty<T extends Record<string, unknown>>(obj: T) {
  return Object.entries(obj).reduce<NonEmpty<T>>(
    (acc, [key, value]) => {
      if (value !== null && value !== undefined) (acc as any)[key] = value
      return acc
    },
    {} as NonEmpty<T>,
  )
}

type NonEmpty<T> = T extends Record<string, unknown>
  ? {
      [K in keyof T as undefined extends T[K] ? K : never]?: Exclude<
        T[K],
        undefined
      >
    } & {
      [K in keyof T as undefined extends T[K] ? never : K]: T[K]
    }
  : T

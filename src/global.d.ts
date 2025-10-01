/**
 * Error.captureStackTrace type for V8
 */
interface ErrorConstructor {
  captureStackTrace(thisArg: any, func: any): void
}

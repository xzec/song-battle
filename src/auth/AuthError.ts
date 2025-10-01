import type { AuthErrorType } from '~/auth/types'

export class AuthError extends Error {
  readonly type: AuthErrorType

  constructor(
    type: AuthErrorType,
    { message, cause }: { message?: string } & ErrorOptions = {},
  ) {
    super(message ?? AuthError.defaultMessage[type], { cause })
    this.name = 'AuthError'
    this.type = type

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AuthError)
    }
  }

  static from(error: unknown, type: AuthErrorType = 'network_error') {
    if (error instanceof this) return error

    if (error instanceof Error) {
      return new this(type, {
        message: error.message,
        cause: error,
      })
    }

    return new this(type, {
      message: typeof error === 'string' ? error : undefined,
      cause: error,
    })
  }

  private static defaultMessage = {
    network_error: 'Network error',
    refresh_failed: 'Failed to refresh Spotify token',
    callback_error: 'Spotify callback error',
    token_exchange_failed: 'Missing authorization code in Spotify callback',
  } as const satisfies Record<AuthErrorType, string>
}

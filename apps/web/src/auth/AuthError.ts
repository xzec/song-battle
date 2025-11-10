type AuthErrorType = 'callback_error' | 'token_exchange_failed' | 'refresh_failed' | 'network_error'

export class AuthError extends Error {
  readonly type: AuthErrorType

  constructor(type: AuthErrorType, { message, cause }: { message?: string } & ErrorOptions = {}) {
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
    callback_error: 'Callback error',
    refresh_failed: 'Token refresh failed',
    token_exchange_failed: 'Token exchange failed',
  } as const satisfies Record<AuthErrorType, string>
}

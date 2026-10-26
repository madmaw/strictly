export type StreamedValue<T> =
  | StreamedValueValue<T>
  | StreamedValueRetry
  | StreamedValueError

export type StreamedValueValue<T> = {
  readonly type: 'value'
  readonly value: T
}

export type StreamedValueRetry = {
  readonly type: 'retry'
  readonly attempts: number
  readonly timeout: number
}

export type StreamedValueError = {
  readonly type: 'error'
  readonly error: unknown
  readonly attempt: number
  readonly timeout: number
  readonly events: number
  readonly connectionDuration: number
}

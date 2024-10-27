import {
  format,
  type FormatArg,
} from './format'

class PreconditionFailedError extends Error {
  constructor(message: string, args: readonly FormatArg[]) {
    super(format(message, ...args))
    this.name = 'PreconditionFailedError'
  }
}

export function checkExists<T>(
  t: T | null | undefined,
  message: string,
  ...args: readonly FormatArg[]
): NonNullable<T> {
  assertExists(t, message, ...args)
  return t
}

export function assertExists<V>(v: V, message: string, ...args: readonly FormatArg[]): asserts v is NonNullable<V> {
  if (v == null) {
    throw new PreconditionFailedError(message, args)
  }
}

export function assertState(
  condition: boolean,
  message: string,
  ...args: readonly FormatArg[]
): asserts condition is true {
  if (!condition) {
    throw new PreconditionFailedError(message, args)
  }
}

export function checkUnary<T>(
  t: readonly T[],
  message: string,
  ...args: readonly FormatArg[]
): T {
  if (t.length !== 1) {
    throw new PreconditionFailedError(message, args)
  }
  return t[0]
}

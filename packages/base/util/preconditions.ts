import {
  format,
  type FormatArg,
} from './format'

export class PreconditionFailedError extends Error {
  constructor(message: string, ...args: readonly FormatArg[]) {
    super(format(message, ...args))
    this.name = 'PreconditionFailedError'
  }
}

export function assertExistsAndReturn<T>(
  t: T,
  message: string,
  ...args: readonly FormatArg[]
): NonNullable<T> {
  assertExists(t, message, ...args)
  return t
}

export function assertExists<V>(v: V, message: string, ...args: readonly FormatArg[]): asserts v is NonNullable<V> {
  if (v == null) {
    throw new PreconditionFailedError(message, ...args)
  }
}

export function assertEqual<T extends FormatArg>(
  a: T,
  b: T,
  message: string = '{} != {}',
  arg1: FormatArg = a,
  arg2: FormatArg = b,
  ...args: readonly FormatArg[]
) {
  if (a !== b) {
    throw new PreconditionFailedError(
      message,
      arg1,
      arg2,
      ...args,
    )
  }
}

export function assertState(
  condition: boolean,
  message: string,
  ...args: readonly FormatArg[]
): asserts condition is true {
  if (!condition) {
    throw new PreconditionFailedError(message, ...args)
  }
}

export function assertIs<V, T extends V>(
  v: V,
  condition: (v: V) => v is T,
  message: string,
  ...args: readonly FormatArg[]
): asserts v is T {
  if (!condition(v)) {
    throw new PreconditionFailedError(message, ...args)
  }
}

export function checkUnary<T>(
  t: readonly T[],
  message: string,
  ...args: readonly FormatArg[]
): T {
  if (t.length !== 1) {
    throw new PreconditionFailedError(message, ...args)
  }
  return t[0]
}

export function checkValidNumber(n: number, message: string, ...args: readonly FormatArg[]): number {
  if (isNaN(n) || !isFinite(n)) {
    throw new PreconditionFailedError(message, ...args)
  }
  return n
}

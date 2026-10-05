import { CancellableIterableCompletedError } from 'cancel/CancellablePromise'
import { type CancellableStep } from 'cancel/iteration/CancellableGenerator'

/**
 * Pulls the next step from an iterator, throwing a CancellableIterableCompletedError with the return value
 * once the iterator is done, so whatever is reading the iterator ends when it does
 * ```
 * const value = yield* wait(next(i))
 * ```
 */
export function next<T, TReturn>(
  // TNext is intentionally `undefined`, disposers are not currently supported in next calls
  i: Iterator<CancellableStep<T> | T, TReturn, undefined>,
): CancellableStep<T> | T {
  const result = i.next()
  if (result.done) {
    throw new CancellableIterableCompletedError(result.value)
  }
  return result.value
}

import { CancellableIterableCompletedError } from 'cancel/CancellablePromise'
import { type CancellableStep } from 'cancel/iteration/CancellableIterable'

/**
 * Pulls the next step from an iterator, throwing a CancellableIterableCompletedError with the return value
 * once the iterator is done, so whatever is reading the iterator ends when it does
 * ```
 * const value = yield* wait(next(i))
 * ```
 * The iterator is resumed without a value, so its `TNext` has to accept `undefined`. An iterator expecting
 * something to be passed back from `yield` (e.g. a disposer) is rejected.
 */
export function next<T, TReturn>(
  i: Iterator<CancellableStep<T> | T, TReturn, undefined>,
): CancellableStep<T> | T {
  const result = i.next()
  if (result.done) {
    throw new CancellableIterableCompletedError(result.value)
  }
  return result.value
}

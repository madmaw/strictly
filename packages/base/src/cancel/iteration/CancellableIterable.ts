/* oxlint-disable typescript/no-explicit-any -- any ok in generics */
import {
  CancellableIterableCompletedError,
  CancellablePromise,
} from 'cancel/CancellablePromise'

/**
 * A synchronous iterator that returns (asynchronous) CancellablePromises. This is superior
 * to AsyncIterator as we can exit the iterator at any point instead of just between async calls.
 */
export type CancellableIterable<T, TReturn = any, TNext = any> = Iterable<
  CancellablePromise<T>,
  TReturn,
  TNext
>

/**
 * Exactly the same as CancellableIterable, but you can also return values synchronously.
 * This is useful for non-api calls where the yielded types tend to be "looser" (hence the
 * name)
 */
export type LooseCancellableIterable<
  T = any,
  TReturn = any,
  TNext = any,
> = Iterable<CancellablePromise<T> | T, TReturn, TNext>

export function* asyncToCancellableIterable<T, TReturn>(
  i: AsyncIterable<T, TReturn>,
  cancel: () => void,
): CancellableIterable<T, TReturn, void> {
  const it = i[Symbol.asyncIterator]()
  let maybeReturnValue: [TReturn] | undefined
  // oxlint-disable-next-line no-unmodified-loop-condition -- maybeReturnValue is assigned inside the async promise callback
  while (maybeReturnValue == null) {
    const promise = it.next()
    const cancellablePromise = new CancellablePromise(
      promise.then(({ value, done }) => {
        if (done) {
          // because we're converting from an async iterator to an iterator of promises, the final
          // promise needs to exit without a value, as a result we throw
          maybeReturnValue = [value]
          throw new CancellableIterableCompletedError(value)
        }
        return value
      }),
      cancel,
    )
    yield cancellablePromise
  }
  return maybeReturnValue[0]
}

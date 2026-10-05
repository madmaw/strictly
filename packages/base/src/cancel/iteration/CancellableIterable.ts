import {
  CancellableIterableCompletedError,
  CancellablePromise,
} from 'cancel/CancellablePromise'

/**
 * A stream whose values are all pending when they are pulled, e.g. a subscription
 */
export type CancellableIterable<
  T,
  TReturn = unknown,
  TNext = unknown,
> = Iterable<CancellablePromise<T>, TReturn, TNext>

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

/* oxlint-disable typescript/no-explicit-any -- any ok in generics */
import {
  CancellableIterableCompletedError,
  CancellablePromise,
} from 'cancel/CancellablePromise'

/**
 * A yielded generator is run to completion as a single step, resolving to its return value
 */
export type CancellableStep<T> =
  | CancellablePromise<T>
  | Generator<unknown, T, any>

/**
 * The value that a yielded step resolves to
 */
export type ResolvedStep<S> =
  S extends Generator<unknown, infer R, any> ? Awaited<R> : Awaited<S>

/**
 * A generator that yields (asynchronous) steps, or values that are already available. This is superior to
 * AsyncGenerator as we can exit the generator at any point instead of just between async calls.
 */
export type CancellableGenerator<
  T = any,
  TReturn = any,
  TNext = any,
> = Generator<CancellableStep<T> | T, TReturn, TNext>

export function* asyncToCancellableGenerator<T, TReturn>(
  i: AsyncIterable<T, TReturn>,
  cancel: () => void,
): Generator<CancellablePromise<T>, TReturn, void> {
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

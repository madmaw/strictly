/* oxlint-disable typescript/no-explicit-any -- any ok in generics */
import { type CancellablePromise } from 'cancel/CancellablePromise'

/**
 * A stream whose values are all pending when they are pulled, e.g. a subscription
 */
export type CancellableIterable<T, TReturn = any, TNext = any> = Iterable<
  CancellablePromise<T>,
  TReturn,
  TNext
>

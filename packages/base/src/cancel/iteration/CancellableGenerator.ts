import { type CancellablePromise } from 'cancel/CancellablePromise'

/**
 * A yielded generator is run to completion as a single step, resolving to its return value
 */
export type CancellableStep<T> = CancellablePromise<T> | Generator<unknown, T>

/**
 * The value that a yielded step resolves to
 */
export type ResolvedStep<S> =
  S extends Generator<unknown, infer R> ? Awaited<R> : Awaited<S>

/**
 * A generator that yields (asynchronous) steps, or values that are already available. This is superior to
 * AsyncGenerator as we can exit the generator at any point instead of just between async calls.
 */
export type CancellableGenerator<
  T,
  TReturn = unknown,
  TNext = unknown,
> = Generator<CancellableStep<T> | T, TReturn, TNext>

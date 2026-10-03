/* oxlint-disable typescript/no-non-null-assertion -- iterator plumbing */
import { type CancellablePromiseDisposer } from 'cancel/Cancellable'
import {
  CancellableIterableCompletedError,
  CancellablePromise,
  type CancellablePromiseFromIterableOptions,
  Cancellation,
} from 'cancel/CancellablePromise'
import { type CancellableStep } from 'cancel/iteration/CancellableIterable'
import { isGenerator } from 'cancel/iteration/isGenerator'
import { isIterable } from 'cancel/iteration/isIterable'
import {
  CancellablePromise as CancellablePromiseImpl,
  isPromiseWithCancel,
  type PromiseWithCancel,
} from 'real-cancellable-promise'
import { type Maybe } from 'types/Maybe'
import { delayAnimationFrame } from 'util/delay'
import { isPromiseLike } from 'util/isPromiseLike'

export function maybeFromPromise<T>(
  cancellable: PromiseLike<T> | PromiseWithCancel<T> | T,
): CancellablePromise<T> | T {
  if (isPromiseWithCancel(cancellable)) {
    if (cancellable instanceof CancellablePromiseImpl) {
      return cancellable
    }
    // assume it's a degenerate implementation of promise-with-cancel that will
    // lose the cancel-ability if then-ed
    return new CancellablePromise(cancellable, () => {
      cancellable.cancel()
    })
  }
  if (isPromiseLike(cancellable)) {
    return CancellablePromise.fromPromiseWithoutCancel(cancellable)
  }
  return cancellable
}

/**
 * Drives the iterator, resolving each yielded step before asking for the next one. A yielded generator
 * is driven as a single step with the same options, with any CancellableIterableCompletedError that
 * escapes it propagated (`propagateCompletion`) so that it ends the enclosing iteration rather than
 * resolving the step.
 */
export function driveIterable<T, TReturn>(
  g: Iterable<CancellableStep<T> | T, TReturn, CancellablePromiseDisposer>,
  {
    wrapper = (f: () => void) => f(),
    consumer,
    blocking,
  }: CancellablePromiseFromIterableOptions<T>,
  propagateCompletion: boolean,
): CancellablePromise<TReturn> {
  const i = isIterable(g) ? g[Symbol.iterator]() : g
  let cancellation: Cancellation | undefined
  // the single promise the loop is currently awaiting (an `all` of the yielded value plus the
  // optional frame delay, or a consumer's promise). Cancelling reaches into it directly rather
  // than threading cancellation through a per-iteration promise chain, so nothing is retained
  // between iterations.
  let pending: CancellablePromise<unknown> | undefined
  const cancel = () => {
    cancellation ??= new Cancellation('iterator cancelled')
    pending?.cancel()
  }
  // awaits `p` while exposing it to `cancel`. If cancellation already arrived synchronously
  // (e.g. the iterator called its disposer inside `i.next`), cancel `p` before awaiting it.
  const track = <V>(p: CancellablePromise<V>): CancellablePromise<V> => {
    pending = p
    if (cancellation != null) {
      p.cancel()
    }
    return p
  }
  const step = (
    maybeError: Maybe<unknown>,
  ): IteratorResult<CancellableStep<T> | T, TReturn> => {
    try {
      let result: IteratorResult<CancellableStep<T> | T, TReturn> | undefined
      wrapper(() => {
        result =
          maybeError == null
            ? // allow iterators to access a destructor when calling yield
              i.next(cancel)
            : i.throw!(maybeError[0])
      })
      // wrapper invokes its callback synchronously
      return result!
    } catch (e) {
      // make any synchronous errors into failing iterators (assume synchronous errors can only
      // come from iterators, not async iterators)
      return {
        done: false,
        value: CancellablePromise.reject(e),
      }
    }
  }
  const consume = async (value: T): Promise<void> => {
    if (consumer == null) {
      return
    }
    const consumed = consumer(value)
    if (consumed != null) {
      await track(CancellablePromise.fromCancellable(consumed))
    }
  }
  // decides what to do when awaiting a yielded value throws: hand the error back to the
  // generator to handle, finish with a return value, or rethrow. The caught error is untyped
  // (any value can be thrown); boxing it for re-throwing is the caller's concern.
  const handleCaught = (
    e: unknown,
    maybeError: Maybe<unknown>,
  ): { retry: unknown } | { finished: TReturn } => {
    if (
      i.throw == null ||
      // throwing the same error reference multiple times indicates that the generator
      // is not handling the error
      (maybeError != null && maybeError[0] === e)
    ) {
      if (
        !propagateCompletion &&
        e instanceof CancellableIterableCompletedError
      ) {
        return { finished: e.returnValue as TReturn }
      }
      throw e
    }
    return { retry: e }
  }
  // only generators are steps, any other iterable (e.g. an array or a string) is a value
  const resolveStep = (
    value: CancellableStep<T> | T,
  ): CancellablePromise<T> | T =>
    isGenerator(value)
      ? driveIterable<unknown, T>(value, { wrapper, blocking }, true)
      : maybeFromPromise(value)
  // awaits a single yielded value (alongside the frame delay that paces non-blocking loops) and
  // feeds any resolved value to the consumer. Returns the error to hand back to the generator on
  // the next step, or a terminal return value.
  const awaitStep = async (
    value: CancellableStep<T> | T,
    maybeError: Maybe<unknown>,
  ): Promise<{ error: Maybe<unknown> } | { finished: TReturn }> => {
    try {
      const [resolved] = await track(
        CancellablePromise.all([
          resolveStep(value),
          blocking ? null : delayAnimationFrame(),
        ]),
      )
      await consume(resolved)
      return { error: null }
    } catch (e) {
      const outcome = handleCaught(e, maybeError)
      return 'finished' in outcome ? outcome : { error: [outcome.retry] }
    }
  }
  const run = async (): Promise<TReturn> => {
    let maybeError: Maybe<unknown> = null
    for (;;) {
      if (cancellation != null && maybeError == null) {
        maybeError = [cancellation]
      }
      const result = step(maybeError)
      if (result.done) {
        return result.value
      }
      const outcome = await awaitStep(result.value, maybeError)
      if ('finished' in outcome) {
        return outcome.finished
      }
      maybeError = outcome.error
    }
  }

  return new CancellablePromise<TReturn>(run(), cancel)
}

import { CancellablePromise } from 'cancel/CancellablePromise'
import { type CancellableStep } from 'cancel/iteration/CancellableIterable'
import { driveIterable, maybeFromPromise } from 'cancel/iteration/driveIterable'
import { isGenerator } from 'cancel/iteration/isGenerator'
import { isStepFactory } from 'cancel/iteration/isStepFactory'
import { isPromiseWithCancel } from 'real-cancellable-promise'

/**
 * Starts a step, or a factory for one, without waiting for it, the way calling an async function without `await` does.
 * The returned promise can be raced or combined with others, and keeps running if it loses a race. A generator step
 * is driven as it would be when yielded, so a CancellableIterableCompletedError escaping it rejects the promise.
 * ```
 * const [a, b] = yield* wait(CancellablePromise.all([start(loadA), start(loadB)]))
 * ```
 */
export function start<T>(
  step: CancellableStep<T> | (() => CancellableStep<T> | T) | T,
): CancellablePromise<T> {
  let started: CancellableStep<T> | T
  try {
    started = isStepFactory(step) ? step() : step
  } catch (e) {
    return CancellablePromise.reject(e)
  }
  if (isGenerator(started)) {
    return driveIterable<unknown, T>(started, { blocking: true }, true)
  }
  const maybePromise = maybeFromPromise(started)
  return isPromiseWithCancel(maybePromise)
    ? maybePromise
    : CancellablePromise.resolve(maybePromise)
}

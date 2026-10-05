import { CancellablePromise } from 'cancel/CancellablePromise'
import { type CancellableStep } from 'cancel/iteration/CancellableGenerator'
import { isGenerator } from 'cancel/iteration/isGenerator'
import { isPromiseLike } from 'util/isPromiseLike'

type YieldStep<T> = Generator<CancellableStep<T>, T, unknown>

/**
 * Yields a single step and returns what it resolves to, keeping the type that a bare `yield` loses.
 * `yield* wait(x)` reads like `await x`, with the iteration driving the generator doing the actual waiting
 * ```
 * // value: number
 * const value = yield* wait(CancellablePromise.resolve(1))
 * // first: Item
 * const first = yield* wait(function* () {
 *   for (let page = 0; ; page++) {
 *     const items = yield* wait(loadPage(page))
 *     if (items.length > 0) return items[0]
 *   }
 * })
 * ```
 * A generator, or a function returning one, runs to completion as one step, so an iterable consuming
 * this generator only sees its return value. A function that can be called without arguments is a
 * factory for the step. Values that are not promises or generators are returned synchronously without
 * yielding.
 */
export function* wait<T>(
  step: CancellableStep<T> | (() => CancellableStep<T> | T) | T,
): YieldStep<T> {
  return yield* waitFor(isFactory(step) ? step() : step)
}

function isFactory<S>(step: S | (() => S)): step is () => S {
  return typeof step === 'function' && step.length === 0
}

function* waitFor<T>(step: CancellableStep<T> | T): YieldStep<T> {
  let result: T | undefined
  if (isGenerator(step)) {
    const generator = step as Generator<unknown, T, unknown>
    yield (function* () {
      result = yield* generator
      return result
    })()
    return result as T
  }
  if (!isPromiseLike(step)) {
    return step
  }
  // the driver resumes the generator with its disposer rather than the resolved value, so capture the
  // value as it passes through
  yield CancellablePromise.fromCancellable(step).then((value) => {
    result = value
    return value
  })
  return result as T
}

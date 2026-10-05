import {
  CancellableIterableCompletedError,
  CancellablePromise,
} from 'cancel/CancellablePromise'
import {
  type CancellableGenerator,
  type CancellableStep,
} from 'cancel/iteration/CancellableGenerator'
import { type CancellableIterable } from 'cancel/iteration/CancellableIterable'
import { next } from 'cancel/iteration/next'
import { wait } from 'cancel/iteration/wait'
import { delay } from 'util/delay'
import { assertState } from 'util/preconditions'

/**
 * Emits a value from the source once `milliseconds` pass without another value arriving. When the source ends, the
 * most recent value is emitted straight away.
 */
export function* debounce<T, TReturn>(
  source: CancellableIterable<T, TReturn> | CancellableGenerator<T, TReturn>,
  milliseconds: number,
): CancellableGenerator<T, TReturn> {
  // a generator's `return` requires a value, a plain iterator's doesn't
  const i: Iterator<CancellableStep<T> | T, TReturn> = source[Symbol.iterator]()
  // the pull from the source is kept between emissions, so a value still on its way when the wait ends isn't lost.
  // The source ending is kept too, so it ends the iteration on the pull after the last emission
  let pending: CancellablePromise<T> | null = null
  const pull = () => {
    assertState(
      pending == null,
      'the previous pull from the source has not been consumed',
    )
    return (pending = CancellablePromise.fromStep(() => next(i)))
  }
  const cancelPull = () => pending?.cancel()
  try {
    for (;;) {
      yield* wait(function* () {
        let latest = yield* wait(pending ?? pull())
        pending = null
        for (;;) {
          const timer = delay(milliseconds)
          try {
            const arrived = yield* wait(
              CancellablePromise.race([
                pull().then((value) => [value] as const),
                timer,
              ]),
            )
            if (arrived == null) {
              return latest
            }
            pending = null
            ;[latest] = arrived
          } catch (e) {
            if (!(e instanceof CancellableIterableCompletedError)) {
              throw e
            }
            return latest
          } finally {
            timer.cancel()
          }
        }
      })
    }
  } finally {
    cancelPull()
    i.return?.()
  }
}

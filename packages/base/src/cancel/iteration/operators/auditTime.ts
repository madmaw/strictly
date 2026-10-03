import {
  CancellableIterableCompletedError,
  CancellablePromise,
} from 'cancel/CancellablePromise'
import {
  type CancellableStep,
  type LooseCancellableIterable,
} from 'cancel/iteration/CancellableIterable'
import { next } from 'cancel/iteration/next'
import { wait } from 'cancel/iteration/wait'
import { delay } from 'util/delay'

/**
 * Once a value arrives, waits `milliseconds` and then emits the most recent value from the source. When the source
 * ends while waiting, the most recent value is still emitted once the wait is over.
 */
export function* auditTime<T, TReturn>(
  source: LooseCancellableIterable<T, TReturn>,
  milliseconds: number,
): Generator<CancellableStep<T>, TReturn, unknown> {
  const i = source[Symbol.iterator]()
  // the pull from the source is kept between emissions, so a value still on its way when the wait ends isn't lost.
  // The source ending is kept too, so it ends the iteration on the pull after the last emission
  let pending = null as CancellablePromise<T> | null
  const pull = () => (pending ??= CancellablePromise.fromStep(() => next(i)))
  try {
    for (;;) {
      yield* wait(function* () {
        let latest = yield* wait(pull())
        pending = null
        const timer = delay(milliseconds)
        try {
          for (;;) {
            const arrived = yield* wait(
              CancellablePromise.race([
                pull().then((value) => ({ value })),
                timer.then(() => null),
              ]),
            )
            if (arrived == null) {
              return latest
            }
            pending = null
            latest = arrived.value
          }
        } catch (e) {
          if (!(e instanceof CancellableIterableCompletedError)) {
            throw e
          }
          yield* wait(timer)
          return latest
        } finally {
          timer.cancel()
        }
      })
    }
  } finally {
    pending?.cancel()
    i.return?.()
  }
}

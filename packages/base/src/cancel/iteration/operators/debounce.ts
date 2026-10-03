import {
  CancellableIterableCompletedError,
  CancellablePromise,
} from 'cancel/CancellablePromise'
import {
  type CancellableStep,
  type LooseCancellableIterable,
} from 'cancel/iteration/CancellableIterable'
import { next } from 'cancel/iteration/next'
import { start } from 'cancel/iteration/start'
import { wait } from 'cancel/iteration/wait'
import { delay } from 'util/delay'

/**
 * Emits a value from the source once `milliseconds` pass without another value arriving. When the source ends, the
 * most recent value is emitted straight away.
 */
export function* debounce<T, TReturn>(
  source: LooseCancellableIterable<T, TReturn>,
  milliseconds: number,
): Generator<CancellableStep<T>, TReturn, unknown> {
  const i = source[Symbol.iterator]()
  // the pull from the source is kept between emissions, so a value still on its way when the wait ends isn't lost.
  // The source ending is kept too, so it ends the iteration on the pull after the last emission
  let pending = null as CancellablePromise<T> | null
  const pull = () => (pending ??= start(() => next(i)))
  try {
    for (;;) {
      yield* wait(function* () {
        let latest = yield* wait(pull())
        pending = null
        for (;;) {
          const timer = delay(milliseconds)
          try {
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
    pending?.cancel()
    i.return?.()
  }
}

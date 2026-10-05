import { CancellablePromise } from 'cancel/CancellablePromise'
import { type CancellableGenerator } from 'cancel/iteration/CancellableGenerator'
import { type CancellableIterable } from 'cancel/iteration/CancellableIterable'
import { delay } from 'util/delay'

export type TimedSource<T, TReturn> = {
  readonly source: Iterator<CancellablePromise<T>, TReturn, undefined> &
    Iterable<CancellablePromise<T>, TReturn, undefined>
  readonly isFinalized: () => boolean
}

/**
 * Emits each value `gap` milliseconds after it is pulled, then returns `returnValue`. Like a subscription, it only
 * holds one pull at a time, so it fails if it is pulled again before the previous value settles. It also fails if
 * it is pulled after it has ended, as an operator should stop pulling once its source ends.
 */
export function timedSource<T, TReturn>(
  events: readonly (readonly [gap: number, value: T])[],
  returnValue: TReturn,
): TimedSource<T, TReturn> {
  let finalized = false
  function* source(): Generator<CancellablePromise<T>, TReturn, unknown> {
    try {
      for (const [gap, value] of events) {
        const pull = { settled: false }
        const promise = delay(gap).then(() => value)
        const markSettled = () => {
          pull.settled = true
        }
        void promise.then(markSettled, markSettled)
        yield promise
        if (!pull.settled) {
          throw new Error('pulled before the previous value settled')
        }
      }
      return returnValue
    } finally {
      finalized = true
    }
  }
  const g = source()
  let completed = false
  return {
    isFinalized: () => finalized,
    source: {
      next() {
        if (completed) {
          throw new Error('pulled after the source ended')
        }
        const result = g.next()
        completed = result.done === true
        return result
      },
      return(value: TReturn) {
        return g.return(value)
      },
      [Symbol.iterator]() {
        return this
      },
    },
  }
}

/**
 * Runs the iterable to completion under fake timers, recording when each value is emitted. Timers are only run until
 * the iteration settles, so any timer it leaves behind is still pending afterwards.
 */
export async function collectTimed<T, TReturn>(
  iterable: CancellableIterable<T, TReturn> | CancellableGenerator<T, TReturn>,
) {
  const start = Date.now()
  const values: (readonly [at: number, value: unknown])[] = []
  const promise = CancellablePromise.fromIterable(iterable, {
    blocking: true,
    consumer: (value) => {
      values.push([Date.now() - start, value])
    },
  })
  const iteration = { settled: false }
  const markSettled = () => {
    iteration.settled = true
  }
  void promise.then(markSettled, markSettled)
  while (!iteration.settled) {
    if (vi.getTimerCount() === 0) {
      await promise
      break
    }
    await vi.advanceTimersToNextTimerAsync()
  }
  return { returnValue: await promise, values }
}

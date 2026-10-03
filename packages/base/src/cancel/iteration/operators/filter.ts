import {
  type CancellableStep,
  type LooseCancellableIterable,
} from 'cancel/iteration/CancellableIterable'
import { next } from 'cancel/iteration/next'
import { wait } from 'cancel/iteration/wait'

/**
 * Emits the values from the source that match the predicate, ending with the source
 */
export function* filter<T, TReturn>(
  source: LooseCancellableIterable<T, TReturn>,
  predicate: (value: T) => boolean,
): Generator<CancellableStep<T>, TReturn, unknown> {
  const i = source[Symbol.iterator]()
  try {
    for (;;) {
      yield* wait(function* () {
        for (;;) {
          const value = yield* wait(next(i))
          if (predicate(value)) {
            return value
          }
        }
      })
    }
  } finally {
    i.return?.()
  }
}

import {
  type CancellableGenerator,
  type CancellableStep,
} from 'cancel/iteration/CancellableGenerator'
import { type CancellableIterable } from 'cancel/iteration/CancellableIterable'
import { next } from 'cancel/iteration/next'
import { wait } from 'cancel/iteration/wait'

/**
 * Emits the values from the source that match the predicate, ending with the source
 */
export function* filter<T, TReturn>(
  source: CancellableIterable<T, TReturn> | CancellableGenerator<T, TReturn>,
  predicate: (value: T) => boolean,
): CancellableGenerator<T, TReturn> {
  // a generator's `return` requires a value, a plain iterator's doesn't
  const i: Iterator<CancellableStep<T> | T, TReturn> = source[Symbol.iterator]()
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

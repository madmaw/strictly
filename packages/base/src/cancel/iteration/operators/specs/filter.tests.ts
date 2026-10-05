import { CancellablePromise } from 'cancel/CancellablePromise'
import { type CancellableGenerator } from 'cancel/iteration/CancellableGenerator'
import { type CancellableIterable } from 'cancel/iteration/CancellableIterable'
import { filter } from 'cancel/iteration/operators/filter'
import { delay } from 'util/delay'

// cancels after `limit` values so that a stream that never ends fails rather than hanging
function collect<T, TReturn>(
  iterable: CancellableIterable<T, TReturn> | CancellableGenerator<T, TReturn>,
  limit = 10,
) {
  const values: unknown[] = []
  const promise = CancellablePromise.fromIterable(iterable, {
    blocking: true,
    consumer: (value) => {
      values.push(value)
      if (values.length >= limit) {
        promise.cancel()
      }
    },
  })
  return promise.then((returnValue) => ({ returnValue, values }))
}

// fails if it is pulled after it has completed, as an operator should stop pulling once its source ends
function oneToFour(): IterableIterator<CancellablePromise<number>, string> {
  const g = (function* () {
    yield CancellablePromise.resolve(1)
    yield CancellablePromise.resolve(2)
    yield CancellablePromise.resolve(3)
    yield CancellablePromise.resolve(4)
    return 'end'
  })()
  let completed = false
  return {
    next() {
      if (completed) {
        throw new Error('pulled after completion')
      }
      const result = g.next()
      completed = result.done === true
      return result
    },
    [Symbol.iterator]() {
      return this
    },
  }
}

describe('filter', () => {
  it('emits the values that match and returns the return value', async () => {
    expect(await collect(filter(oneToFour(), (v) => v % 2 === 0))).toEqual({
      values: [2, 4],
      returnValue: 'end',
    })
  })

  it('composes', async () => {
    const filtered = filter(
      filter(
        filter(oneToFour(), (v) => v > 1),
        (v) => v < 4,
      ),
      (v) => v % 2 === 0,
    )
    expect(await collect(filtered)).toEqual({
      values: [2],
      returnValue: 'end',
    })
  })

  it('cancels through the chain', async () => {
    const pending = CancellablePromise.infinite<number>()
    const onSourceFinally = vi.fn()
    function* source() {
      try {
        yield CancellablePromise.resolve(1)
        yield pending
      } finally {
        onSourceFinally()
      }
    }
    const consumer = vi.fn()
    const promise = CancellablePromise.fromIterable(
      filter(
        filter(source(), () => true),
        () => true,
      ),
      { blocking: true, consumer },
    )
    await delay()
    promise.cancel()

    await expect(promise).rejects.toBeDefined()
    await expect(pending).rejects.toBeDefined()
    expect(consumer).toHaveBeenCalledExactlyOnceWith(1)
    expect(onSourceFinally).toHaveBeenCalledOnce()
  })
})

import { CancellablePromise } from 'cancel/CancellablePromise'
import { type LooseCancellableIterable } from 'cancel/iteration/CancellableIterable'
import { next } from 'cancel/iteration/next'
import { wait } from 'cancel/iteration/wait'
import { delay } from 'util/delay'

function* filterAwaited<T, TReturn>(
  source: LooseCancellableIterable<T, TReturn>,
  predicate: (value: T) => boolean,
  onFinally: () => void = () => {},
) {
  const i = source[Symbol.iterator]()
  function* nextMatch() {
    for (;;) {
      const value = yield* wait(next(i))
      if (predicate(value)) {
        return value
      }
    }
  }
  try {
    for (;;) {
      yield* wait(nextMatch())
    }
  } finally {
    onFinally()
    i.return?.()
  }
}

// cancels after `limit` values so that a stream that never ends fails rather than hanging
function collect<T, TReturn>(
  iterable: LooseCancellableIterable<T, TReturn>,
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
function oneToFour(): IterableIterator<
  CancellablePromise<number> | number,
  string
> {
  const g = (function* () {
    yield CancellablePromise.resolve(1)
    yield 2
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

describe('wait', () => {
  describe('types', () => {
    it('returns the resolved type of a promise', () => {
      function* g() {
        const value = yield* wait(CancellablePromise.resolve(1))
        expectTypeOf(value).toEqualTypeOf<number>()
      }
      expect(g).toBeDefined()
    })

    it('returns the return type of a generator', () => {
      function* step() {
        yield CancellablePromise.resolve(1)
        return 'a'
      }
      function* g() {
        const value = yield* wait(step())
        expectTypeOf(value).toEqualTypeOf<string>()
      }
      expect(g).toBeDefined()
    })

    it('returns the return type of a factory', () => {
      function* g() {
        const value = yield* wait(function* () {
          yield CancellablePromise.resolve(1)
          return 'a'
        })
        expectTypeOf(value).toEqualTypeOf<string>()
      }
      expect(g).toBeDefined()
    })

    it('returns functions that need arguments as values', () => {
      const f = (n: number) => n
      function* g() {
        const value = yield* wait(f)
        expectTypeOf(value).toEqualTypeOf<(n: number) => number>()
        return value
      }
      expect(g().next()).toEqual({ done: true, value: f })
    })
  })

  describe('in a flow', () => {
    it('returns a value synchronously', () => {
      function* g() {
        return yield* wait(1)
      }
      expect(g().next()).toEqual({ done: true, value: 1 })
    })

    it('returns the resolved value of a promise', async () => {
      function* g() {
        const value = yield* wait(CancellablePromise.resolve(1))
        return value + 1
      }
      expect(await CancellablePromise.fromIterable(g())).toEqual(2)
    })

    it.each([
      ['generator', (step: () => Generator<unknown, number>) => wait(step())],
      ['factory', (step: () => Generator<unknown, number>) => wait(step)],
    ])('returns the return value of a %s', async (_name, toY) => {
      function* step() {
        const a = yield* wait(CancellablePromise.resolve(1))
        const b = yield* wait(delay().then(() => 2))
        return a + b
      }
      function* g() {
        const value = yield* toY(step)
        return value + 1
      }
      expect(await CancellablePromise.fromIterable(g())).toEqual(4)
    })

    it('runs a function returning a promise', async () => {
      function* g() {
        return yield* wait(() => CancellablePromise.resolve(1))
      }
      expect(await CancellablePromise.fromIterable(g())).toEqual(1)
    })

    it('passes errors from a step back to the generator', async () => {
      function* g() {
        try {
          yield* wait(function* () {
            yield* wait(delay())
            throw new Error('step failed')
          })
          return null
        } catch (e) {
          return e instanceof Error ? e.message : null
        }
      }
      expect(await CancellablePromise.fromIterable(g())).toEqual('step failed')
    })
  })

  describe('in a stream', () => {
    it('emits a step as a single value', async () => {
      function* g() {
        yield* wait(function* () {
          yield CancellablePromise.resolve('ignored')
          return 'a'
        })
        yield* wait(CancellablePromise.resolve('b'))
      }
      const { values } = await CancellablePromise.valuesFromIterable(g())
      expect(values).toEqual(['a', 'b'])
    })

    it('runs steps with the options of the iteration', async () => {
      let wrapped = false
      const wrapper = (f: () => void) => {
        wrapped = true
        try {
          f()
        } finally {
          wrapped = false
        }
      }
      let wrappedAfterDelay: boolean | undefined
      function* g() {
        yield* wait(function* () {
          yield* wait(delay())
          wrappedAfterDelay = wrapped
        })
      }
      await CancellablePromise.fromIterable(g(), { wrapper })
      expect(wrappedAfterDelay).toBe(true)
    })
  })

  describe('filterAwaited', () => {
    it('emits the values that match and returns the return value', async () => {
      const onFinally = vi.fn()
      expect(
        await collect(
          filterAwaited(oneToFour(), (v) => v % 2 === 0, onFinally),
        ),
      ).toEqual({ values: [2, 4], returnValue: 'end' })
      expect(onFinally).toHaveBeenCalledOnce()
    })

    it('composes', async () => {
      const onFinally = vi.fn()
      const filtered = filterAwaited(
        filterAwaited(
          filterAwaited(oneToFour(), (v) => v > 1, onFinally),
          (v) => v < 4,
          onFinally,
        ),
        (v) => v % 2 === 0,
        onFinally,
      )
      expect(await collect(filtered)).toEqual({
        values: [2],
        returnValue: 'end',
      })
      expect(onFinally).toHaveBeenCalledTimes(3)
    })

    it('cancels through the chain', async () => {
      const pending = CancellablePromise.infinite<number>()
      const onSourceFinally = vi.fn()
      const onFinally = vi.fn()
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
        filterAwaited(
          filterAwaited(source(), () => true, onFinally),
          () => true,
          onFinally,
        ),
        { blocking: true, consumer },
      )
      await delay()
      promise.cancel()

      await expect(promise).rejects.toBeDefined()
      await expect(pending).rejects.toBeDefined()
      expect(consumer.mock.calls).toEqual([[1]])
      expect(onSourceFinally).toHaveBeenCalledOnce()
      expect(onFinally).toHaveBeenCalledTimes(2)
    })
  })
})

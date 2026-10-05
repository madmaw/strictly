import { CancellablePromise } from 'cancel/CancellablePromise'
import { wait } from 'cancel/iteration/wait'
import { delay } from 'util/delay'

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

    it('returns functions that need arguments as values when typed as values', () => {
      const f = (n: number) => n
      function* g() {
        const value = yield* wait<typeof f>(f)
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
})

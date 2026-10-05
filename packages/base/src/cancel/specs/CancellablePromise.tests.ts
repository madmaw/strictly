import type { CancellablePromiseDisposer } from 'cancel/Cancellable'
import {
  CancellableIterableCompletedError,
  CancellablePromise,
  Cancellation,
} from 'cancel/CancellablePromise'
import { delay, infiniteDelay } from 'util/delay'
import type { Mocked } from 'vite-plus/test'

// plain (non-generator) iterables that only expose the iterator protocol of the wrapped generator
function toIterable<T, TReturn, TNext>(
  g: Generator<T, TReturn, TNext>,
): Iterable<T, TReturn, TNext> {
  return {
    [Symbol.iterator]: () => ({
      next: (...args: [] | [TNext]) => g.next(...args),
      return: (value: TReturn) => g.return(value),
      throw: (e: unknown) => g.throw(e),
    }),
  }
}

function toAsyncIterable<T, TReturn, TNext>(
  g: AsyncGenerator<T, TReturn, TNext>,
): AsyncIterable<T, TReturn, TNext> {
  return {
    [Symbol.asyncIterator]: () => ({
      next: (...args: [] | [TNext]) => g.next(...args),
      return: (value: TReturn) => g.return(value),
      throw: (e: unknown) => g.throw(e),
    }),
  }
}

// oxlint-disable-next-line typescript/no-explicit-any -- any fine in generics
function toAsyncGeneratorAndIterable<P extends any[], T, TReturn>(
  f: (...p: P) => AsyncGenerator<T, TReturn>,
) {
  return [
    ['generator', f],
    ['iterable', (...p: P) => toAsyncIterable(f(...p))],
  ] as const
}

// oxlint-disable-next-line typescript/no-explicit-any -- any fine in generics
function toGeneratorAndIterable<P extends any[], T, TReturn>(
  f: (...p: P) => Generator<T, TReturn>,
) {
  return [
    ['generator', f],
    ['iterable', (...p: P) => toIterable(f(...p))],
  ] as const
}

describe('CancellablePromise', () => {
  describe('fromAsyncIterable', () => {
    describe('cancel', () => {
      let infinite: CancellablePromise<void>
      async function* g(): AsyncGenerator<void> {
        await infinite
        yield
      }

      beforeEach(() => {
        infinite = CancellablePromise.infinite()
      })

      describe.each(toAsyncGeneratorAndIterable(g))('%s', (_name, i) => {
        describe('cancellation error', () => {
          let promise: CancellablePromise<void>
          beforeEach(() => {
            promise = CancellablePromise.fromAsyncIterable(i())
            promise.cancel()
          })

          afterEach(async () => {
            // force cancel
            infinite.cancel()
            await CancellablePromise.ignoreCancellationErrors(infinite)
          })

          it('cancels the promise', async () => {
            await expect(promise).rejects.toBeDefined()
          })

          // fails because we can't cancel underlying promises with async
          // oxlint-disable-next-line vitest/no-disabled-tests -- documents a known async cancellation limitation
          it.skip('cancels the underlying promise', async () => {
            await expect(infinite).rejects.toBeDefined()
          })
        })
      })
    })

    describe('return value', () => {
      async function* g() {
        yield await CancellablePromise.resolve()
        return 1
      }

      describe.each(toAsyncGeneratorAndIterable(g))('%s', (_name, i) => {
        let result: number
        beforeEach(async () => {
          result = await CancellablePromise.fromAsyncIterable<void, number>(i())
        })

        it('returns the expected value', () => {
          expect(result).toEqual(1)
        })
      })
    })

    describe('error handling', () => {
      describe('asynchronous errors', () => {
        async function* g() {
          try {
            yield await CancellablePromise.reject<void>(new Error())
            return 1
          } catch (_e) {
            return 2
          }
        }

        describe.each(toAsyncGeneratorAndIterable(g))('%s', (_name, i) => {
          let result: number
          beforeEach(async () => {
            result = await CancellablePromise.fromAsyncIterable<void, number>(
              i(),
            )
          })

          it('returns the expected value', () => {
            expect(result).toEqual(2)
          })
        })
      })

      describe('synchronous errors', () => {
        async function* g() {
          try {
            yield await CancellablePromise.resolve<void>(undefined)
            throw new Error()
          } catch (_e) {
            return 2
          }
        }

        describe.each(toAsyncGeneratorAndIterable(g))('%s', (_name, i) => {
          let result: number
          beforeEach(async () => {
            result = await CancellablePromise.fromAsyncIterable<void, number>(
              i(),
            )
          })

          it('returns the expected value', () => {
            expect(result).toEqual(2)
          })
        })
      })
    })

    describe('synchronous error handling', () => {
      async function* g() {
        try {
          yield await CancellablePromise.resolve()
          throw new Error()
        } catch (_e) {
          return 2
        }
      }

      describe.each(toAsyncGeneratorAndIterable(g))('%s', (_name, i) => {
        let result: number
        beforeEach(async () => {
          result = await CancellablePromise.fromAsyncIterable<void, number>(i())
        })

        it('returns the expected value', () => {
          expect(result).toEqual(2)
        })
      })
    })

    describe('consume', () => {
      async function* g() {
        yield await CancellablePromise.resolve(1)
        yield await CancellablePromise.resolve(3)
        yield await CancellablePromise.resolve(8)
        yield 13
      }

      describe.each(toAsyncGeneratorAndIterable(g))('%s', (_name, i) => {
        let consumer: Mocked<(n: number) => void>
        beforeEach(async () => {
          consumer = vi.fn()
          await CancellablePromise.fromAsyncIterable<number, void>(i(), {
            consumer,
          })
        })

        it('calls the expected number of times', () => {
          expect(consumer).toHaveBeenCalledTimes(4)
        })

        it('consumes the yielded values', () => {
          expect(consumer).toHaveBeenNthCalledWith(1, 1)
          expect(consumer).toHaveBeenNthCalledWith(2, 3)
          expect(consumer).toHaveBeenNthCalledWith(3, 8)
          expect(consumer).toHaveBeenNthCalledWith(4, 13)
        })
      })
    })

    describe('fromIterable', () => {
      describe('cancel', () => {
        let infinite: CancellablePromise<void>
        function* g(): Generator<CancellablePromise<void>, void> {
          yield infinite
        }

        beforeEach(() => {
          infinite = CancellablePromise.infinite()
        })

        describe.each(toGeneratorAndIterable(g))('%s', (_name, i) => {
          describe('cancellation error', () => {
            let promise: CancellablePromise<void>
            beforeEach(() => {
              promise = CancellablePromise.fromIterable(i())
              promise.cancel()
            })

            afterEach(async () => {
              await CancellablePromise.ignoreCancellationErrors(promise)
            })

            it('cancels the promise', async () => {
              await expect(promise).rejects.toBeDefined()
            })

            it('cancels the underlying promise', async () => {
              await expect(infinite).rejects.toBeDefined()
            })
          })
        })
      })

      describe('internal cancel', () => {
        let infinite: CancellablePromise<void>
        function* g(): Generator<
          CancellablePromise<void> | void,
          void,
          CancellablePromiseDisposer
        > {
          const cancel = yield
          cancel()
          yield infinite
        }

        beforeEach(() => {
          infinite = CancellablePromise.infinite()
        })

        describe.each(toGeneratorAndIterable(g))('%s', (_name, i) => {
          describe('cancellation error', () => {
            let promise: CancellablePromise<void>
            beforeEach(() => {
              promise = CancellablePromise.fromIterable(i())
            })

            afterEach(async () => {
              await CancellablePromise.ignoreCancellationErrors(promise)
            })

            it('cancels the promise', async () => {
              await expect(promise).rejects.toBeDefined()
            })

            it('cancels the underlying promise', async () => {
              await expect(infinite).rejects.toBeDefined()
            })
          })
        })
      })

      describe('return value', () => {
        function* g() {
          yield CancellablePromise.resolve()
          return 1
        }

        describe.each(toGeneratorAndIterable(g))('%s', (_name, i) => {
          let result: number
          beforeEach(async () => {
            result = await CancellablePromise.fromIterable(i())
          })

          it('returns the expected value', () => {
            expect(result).toEqual(1)
          })
        })
      })

      describe('error handling', () => {
        describe('asynchronous errors', () => {
          function* g() {
            try {
              yield CancellablePromise.reject<void>(new Error())
              return 1
            } catch (_e) {
              return 2
            }
          }

          describe.each(toGeneratorAndIterable(g))('%s', (_name, i) => {
            let result: number
            beforeEach(async () => {
              result = await CancellablePromise.fromIterable(i())
            })

            it('returns the expected value', () => {
              expect(result).toEqual(2)
            })
          })
        })

        describe('nested asynchronous errors', () => {
          function* g() {
            try {
              yield CancellablePromise.reject<void>(new Error())
              return 1
            } catch (_e) {
              try {
                yield CancellablePromise.reject<void>(new Error())
                return 2
              } catch (_e) {
                try {
                  yield CancellablePromise.reject<void>(new Error())
                  return 3
                } catch (_e) {
                  return 4
                }
              }
            }
          }

          describe.each(toGeneratorAndIterable(g))('%s', (_name, i) => {
            let result: number
            beforeEach(async () => {
              result = await CancellablePromise.fromIterable(i())
            })

            it('returns the expected value', () => {
              expect(result).toEqual(4)
            })
          })
        })

        describe('synchronous errors', () => {
          function* g() {
            try {
              yield CancellablePromise.resolve()
              throw new Error()
            } catch (_e) {
              return 2
            }
          }

          describe.each(toGeneratorAndIterable(g))('%s', (_name, i) => {
            let result: number
            beforeEach(async () => {
              result = await CancellablePromise.fromIterable(i())
            })

            it('returns the expected value', () => {
              expect(result).toEqual(2)
            })
          })
        })
      })

      describe('synchronous error handling', () => {
        function* g() {
          try {
            yield CancellablePromise.resolve()
            throw new Error()
          } catch (_e) {
            return 2
          }
        }

        describe.each(toGeneratorAndIterable(g))('%s', (_name, i) => {
          let result: number
          beforeEach(async () => {
            result = await CancellablePromise.fromIterable(i())
          })

          it('returns the expected value', () => {
            expect(result).toEqual(2)
          })
        })
      })

      describe('consume', () => {
        function* g() {
          yield CancellablePromise.resolve(1)
          yield CancellablePromise.resolve(3)
          yield CancellablePromise.resolve(8)
          yield 13
        }

        describe.each(toGeneratorAndIterable(g))('%s', (_name, i) => {
          let consumer: Mocked<(n: number) => void>
          beforeEach(async () => {
            consumer = vi.fn()
            await CancellablePromise.fromIterable(i(), {
              consumer,
            })
          })

          it('calls the expected number of times', () => {
            expect(consumer).toHaveBeenCalledTimes(4)
          })

          it('consumes the yielded values', () => {
            expect(consumer).toHaveBeenNthCalledWith(1, 1)
            expect(consumer).toHaveBeenNthCalledWith(2, 3)
            expect(consumer).toHaveBeenNthCalledWith(3, 8)
            expect(consumer).toHaveBeenNthCalledWith(4, 13)
          })
        })
      })

      describe('yielded iterables', () => {
        it('consumes iterables that are not generators as values', async () => {
          function* g() {
            yield [1, 2]
            yield 'ab'
            yield new Set([3])
          }
          const { values } = await CancellablePromise.valuesFromIterable(g())
          expect(values).toEqual([[1, 2], 'ab', new Set([3])])
        })

        it('runs generators as a single step', async () => {
          function* step() {
            yield CancellablePromise.resolve(1)
            return 2
          }
          function* g() {
            yield step()
          }
          const { values } = await CancellablePromise.valuesFromIterable(g())
          expect(values).toEqual([2])
        })
      })
    })
  })

  describe('fromCancellable', () => {
    it('runs a generator to its return value', async () => {
      function* g() {
        yield CancellablePromise.resolve('ignored')
        return 1
      }
      expect(await CancellablePromise.fromCancellable(g())).toEqual(1)
    })

    it.each([
      ['an array', [1, 2]],
      ['a string', 'ab'],
      ['a set', new Set([1])],
    ])('resolves %s as a value', async (_name, value) => {
      expect(await CancellablePromise.fromCancellable(value)).toEqual(value)
    })
  })

  describe('maybeFromCancellable', () => {
    it('returns iterables that are not generators synchronously', () => {
      const value = [1, 2]
      expect(CancellablePromise.maybeFromCancellable(value)).toBe(value)
    })
  })

  describe('fromStep', () => {
    it('resolves a value', async () => {
      expect(await CancellablePromise.fromStep(1)).toEqual(1)
    })

    it('resolves a promise', async () => {
      expect(
        await CancellablePromise.fromStep(CancellablePromise.resolve(1)),
      ).toEqual(1)
    })

    it('resolves a generator to its return value', async () => {
      function* step() {
        yield CancellablePromise.resolve('ignored')
        return 1
      }
      expect(await CancellablePromise.fromStep(step())).toEqual(1)
    })

    it('starts a step from a factory', async () => {
      expect(await CancellablePromise.fromStep(() => 1)).toEqual(1)
    })

    it('rejects when the factory throws', async () => {
      await expect(
        CancellablePromise.fromStep(() => {
          throw new Error('factory failed')
        }),
      ).rejects.toThrow('factory failed')
    })

    it('rejects with a completion that escapes a generator', async () => {
      function* step(): Generator<CancellablePromise<never>, number> {
        yield CancellablePromise.reject(
          new CancellableIterableCompletedError('end'),
        )
        return 1
      }
      await expect(CancellablePromise.fromStep(step())).rejects.toThrow(
        CancellableIterableCompletedError,
      )
    })

    it('cancels a generator step', async () => {
      const pending = CancellablePromise.infinite()
      function* step() {
        yield pending
      }
      const promise = CancellablePromise.fromStep(step())
      await delay()
      promise.cancel()

      await expect(promise).rejects.toBeDefined()
      await expect(pending).rejects.toBeDefined()
    })
  })

  describe('raceAndCancelLosers', () => {
    let promise1: CancellablePromise<number>
    let promise2: CancellablePromise<number>
    let promise3: CancellablePromise<number>
    describe('success', () => {
      let result: number

      beforeEach(async () => {
        promise1 = infiniteDelay().then(() => 1)
        promise2 = infiniteDelay().then(() => 2)
        promise3 = CancellablePromise.resolve(3)

        const promise = CancellablePromise.raceAndCancelLosers([
          promise1,
          promise2,
          promise3,
        ])

        result = await promise
      })

      it('cancels the two losing promises', async () => {
        await expect(promise1).rejects.toBeInstanceOf(Cancellation)
        await expect(promise2).rejects.toBeInstanceOf(Cancellation)
      })

      it('uses the winning promise result', () => {
        expect(result).toBe(3)
      })

      it('does not cancel the winning promise', async () => {
        await expect(promise3).resolves.toBe(3)
      })
    })

    describe('failure', () => {
      const error = new Error()

      beforeEach(async () => {
        promise1 = infiniteDelay().then(() => 1)
        promise2 = infiniteDelay().then(() => 2)
        promise3 = CancellablePromise.reject(error)

        const promise = CancellablePromise.raceAndCancelLosers([
          promise1,
          promise2,
          promise3,
        ])

        await expect(promise).rejects.toEqual(error)
      })

      it('cancels the two losing promises', async () => {
        await expect(promise1).rejects.toBeInstanceOf(Cancellation)
        await expect(promise2).rejects.toBeInstanceOf(Cancellation)
      })

      it('does not cancel the winning promise', async () => {
        await expect(promise3).rejects.toBe(error)
      })
    })

    describe('cancellation', () => {
      class SpecialCancellation extends Cancellation {}

      function specialInfiniteDelay<T = void>(): CancellablePromise<T> {
        let doCancel: ((e: unknown) => void) | undefined
        return new CancellablePromise(
          new Promise((_res, rej) => {
            doCancel = rej
          }),
          () => {
            doCancel?.(new SpecialCancellation('infinite cancelled'))
          },
        )
      }

      beforeEach(async () => {
        promise1 = infiniteDelay().then(() => 1)
        promise2 = infiniteDelay().then(() => 2)
        promise3 = specialInfiniteDelay().then(() => 3)

        const promise = CancellablePromise.raceAndCancelLosers([
          promise1,
          promise2,
          promise3,
        ])

        promise3.cancel()

        await expect(promise).rejects.toBeInstanceOf(SpecialCancellation)
      })

      it('cancels the two losing promises', async () => {
        await expect(promise1).rejects.toBeInstanceOf(Cancellation)
        await expect(promise1).rejects.not.toBeInstanceOf(SpecialCancellation)
        await expect(promise2).rejects.toBeInstanceOf(Cancellation)
        await expect(promise2).rejects.not.toBeInstanceOf(SpecialCancellation)
      })

      it('cancels the winning promise', async () => {
        await expect(promise3).rejects.toBeInstanceOf(SpecialCancellation)
      })
    })

    describe('targeted cancellation', () => {
      beforeEach(async () => {
        promise1 = delay(0).then(() => 1)
        promise2 = delay(100).then(() => 2)
        promise3 = infiniteDelay().then(() => 3)

        const promise = CancellablePromise.raceAndCancelLosers(
          [promise1, promise2, promise3],
          (p) => p === promise3,
        )

        await expect(promise).resolves.toBe(1)
      })

      it('cancels the infinite promise', async () => {
        await expect(promise3).rejects.toBeInstanceOf(Cancellation)
      })

      it('does not cancel the longer running promise', async () => {
        await expect(promise2).resolves.toBe(2)
      })
    })
  })
})

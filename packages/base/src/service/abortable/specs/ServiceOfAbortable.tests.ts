import {
  CancellablePromise,
  ToValuesPromiseError,
} from 'cancel/CancellablePromise'
import {
  type AbortableOfService,
  type AbortableOptions,
  IdleTimeoutError,
  type ServiceOfAbortable,
  serviceOfAbortable,
  streaming,
  unary,
} from 'service/abortable/ServiceOfAbortable'
import { type StreamedValue } from 'service/abortable/StreamedValue'
import { type delay as delayImpl } from 'util/delay'
import { type Mock } from 'vite-plus/test'

describe('Abortable', () => {
  describe('ServiceOfAbortable', () => {
    describe('unary', () => {
      describe('with operation', () => {
        type A = {
          op: (options: AbortableOptions, p: number) => Promise<number>
        }
        type C = ServiceOfAbortable<A>

        it('equals expected type', () => {
          type T = {
            op: (p: number) => CancellablePromise<number>
          }
          expectTypeOf<C>().toEqualTypeOf<T>()
        })
      })

      describe('with class', () => {
        class A {
          op(_options: AbortableOptions, _p: number) {
            return Promise.resolve(1)
          }
        }

        type C = ServiceOfAbortable<A>

        it('equals expected type', () => {
          type T = {
            op: (p: number) => CancellablePromise<number>
          }
          expectTypeOf<C>().toEqualTypeOf<T>()
        })
      })

      describe('with cancellable promise operation', () => {
        type A = {
          op: (
            options: AbortableOptions,
            p: number,
          ) => CancellablePromise<number>
        }
        type C = ServiceOfAbortable<A>

        it('equals expected type', () => {
          type T = {
            op: (p: number) => CancellablePromise<number>
          }
          expectTypeOf<C>().toEqualTypeOf<T>()
        })
      })

      describe('with missing parameters', () => {
        type A = {
          op: () => Promise<void>
        }
        type C = ServiceOfAbortable<A>

        it('equals expected type', () => {
          type T = {
            op: () => CancellablePromise<void>
          }
          expectTypeOf<C>().toEqualTypeOf<T>()
        })
      })
    })
    describe('streaming', () => {
      describe('async iterable', () => {
        type A = {
          op: (
            options: AbortableOptions,
            x: number,
          ) => AsyncIterable<number, boolean, string>
        }
        type C = ServiceOfAbortable<A>

        it('equals expected type', () => {
          type T = {
            op: (
              x: number,
            ) => Iterable<
              CancellablePromise<StreamedValue<number>>,
              boolean,
              string
            >
          }
          expectTypeOf<C>().toEqualTypeOf<T>()
        })
      })
    })
  })

  describe('AbortableOfService', () => {
    describe('unary', () => {
      type C = {
        op: (p: number) => CancellablePromise<number>
      }
      type A = AbortableOfService<C>

      it('equals expected type', () => {
        type T = {
          op: (options: AbortableOptions, p: number) => Promise<number>
        }
        expectTypeOf<A>().toEqualTypeOf<T>()
      })
    })

    describe('streaming', () => {
      type C = {
        op: (
          x: number,
        ) => Iterable<
          CancellablePromise<StreamedValue<number>>,
          boolean,
          string
        >
      }
      type A = AbortableOfService<C>

      it('equals expected type', () => {
        type T = {
          op: (
            options: AbortableOptions,
            x: number,
          ) => AsyncIterable<number, boolean, string>
        }
        expectTypeOf<A>().toEqualTypeOf<T>()
      })
    })

    describe('passes through non cancellable operations', () => {
      type A = {
        op: () => boolean
      }
      type C = AbortableOfService<A>

      it('equals self', () => {
        expectTypeOf<C>().toEqualTypeOf<A>()
      })
    })

    describe('passes through non cancellable operations with parameters', () => {
      type A = {
        op: (n: number) => number
      }
      type C = AbortableOfService<A>

      it('equals self', () => {
        expectTypeOf<C>().toEqualTypeOf<A>()
      })
    })
  })

  describe('serviceOfAbortable', () => {
    describe('unary', () => {
      describe('proxy a class', () => {
        let op: Mock<
          (options: AbortableOptions, n: number) => Promise<number>
        > = vi.fn()
        const timeoutMs = 100

        class A {
          @unary()
          op(options: AbortableOptions, n: number) {
            return op(options, n)
          }
        }
        beforeEach(() => {
          op = vi.fn().mockResolvedValue(1)
        })

        const c = serviceOfAbortable(new A(), {
          initialIdleTimeout: timeoutMs,
        })

        it('returns the expected value', async () => {
          const value = await c.op(2)
          expect(value).toBe(1)
        })

        it('calls the underlying service', async () => {
          await c.op(2)
          expect(op).toHaveBeenCalledExactlyOnceWith(
            expect.objectContaining({
              timeoutMs,
            }),
            2,
          )
        })
      })

      describe('cancel-ability', () => {
        class A {
          @unary()
          op({ signal }: AbortableOptions) {
            return new Promise((_res, rej) => {
              // block until aborted
              signal.addEventListener('abort', rej)
            })
          }
        }

        let c: ServiceOfAbortable<A>

        beforeEach(() => {
          c = serviceOfAbortable(new A())
        })

        it('aborts expectedly', async () => {
          const promise = c.op()
          promise.cancel()
          // should exit immediately with a cancellation error, or the unit tests will timeout if it fails
          await expect(promise).rejects.toBeDefined()
        })
      })

      describe('timeout', () => {
        const operationTimeoutMs = 100
        const operationDurationMs = 105

        function slowOperation() {
          return new Promise<number>((res) => {
            setTimeout(() => res(1), operationDurationMs)
          })
        }

        class A {
          @unary()
          op({ timeoutMs }: AbortableOptions) {
            return new Promise((_res, rej) => {
              // block until timeout
              setTimeout(() => rej(new Error()), timeoutMs)
            })
          }

          @unary()
          slowOp(_options: AbortableOptions) {
            return slowOperation()
          }

          @unary({ initialIdleTimeout: operationTimeoutMs })
          slowOpWithTimeoutOverride(_options: AbortableOptions) {
            return slowOperation()
          }
        }

        let c: ServiceOfAbortable<A>

        beforeEach(() => {
          c = serviceOfAbortable(new A(), {
            initialIdleTimeout: 0,
          })
        })

        it("times out using the operation's own timeoutMs", async () => {
          await expect(c.op()).rejects.toBeDefined()
        })

        it('aborts an operation that exceeds the timeout', async () => {
          await expect(c.slowOp()).rejects.toBeInstanceOf(IdleTimeoutError)
        })

        it('completes an operation that exceeds the service timeout but not its override', async () => {
          await expect(c.slowOpWithTimeoutOverride()).resolves.toBe(1)
        })
      })

      describe('retryable', () => {
        describe('retries until success', () => {
          let op: Mock<(options: AbortableOptions) => Promise<number>> = vi.fn()
          const timeoutMs = 100
          let onDiscardError: Mock<() => void>
          let delay: Mock<typeof delayImpl>
          class A {
            @unary({ retry: true })
            op(options: AbortableOptions) {
              return op(options)
            }
          }
          let c: ServiceOfAbortable<A>
          let value: number

          beforeEach(async () => {
            onDiscardError = vi.fn()
            delay = vi.fn().mockReturnValue(CancellablePromise.delay(0))
            op = vi
              .fn()
              .mockRejectedValueOnce(new Error())
              .mockRejectedValueOnce(new Error())
              .mockResolvedValue(1)
            c = serviceOfAbortable(new A(), {
              delay,
              initialIdleTimeout: timeoutMs,
              makeRetryable: () => true,
              maxUnaryRetries: 3,
              onDiscardError,
            })
            value = await c.op()
          })

          it('returns the expected value', () => {
            expect(value).toBe(1)
          })

          it('calls the underlying operation until it succeeds', () => {
            expect(op).toHaveBeenCalledTimes(3)
          })

          it('calls onDiscardError', () => {
            expect(onDiscardError).toHaveBeenCalledTimes(2)
          })
        })
      })
    })

    describe('streaming', () => {
      let delay: Mock<typeof delayImpl>
      beforeEach(() => {
        delay = vi.fn().mockReturnValue(CancellablePromise.delay(0))
      })

      describe('failing', () => {
        const error = new Error('test error')
        async function* i(): AsyncGenerator<number> {
          yield await Promise.reject(error)
        }

        class A {
          @streaming()
          op(options: AbortableOptions) {
            return operation(options)
          }
        }

        let operation: Mock<
          (options: AbortableOptions) => AsyncIterable<number>
        >
        let a: A
        let c: ServiceOfAbortable<A>
        let promise: Promise<{ values: StreamedValue<number>[] }>
        const streamLifespanTimeout = 2000

        beforeEach(async () => {
          operation = vi.fn(() => i())
          a = new A()
          c = serviceOfAbortable(a, {
            __exitStreamingOnDone: true,
            delay,
            initialIdleTimeout: 100,
            makeRetryable: () => true,
            maxStreamingRetries: 2,
            streamLifespanTimeout,
            timeoutBackoffMultiplier: 3,
          })
          promise = CancellablePromise.valuesFromIterable(c.op())
          await expect(promise).rejects.toBeDefined()
        })

        it('calls operation three times (one initial, two retries)', () => {
          expect(operation).toHaveBeenCalledTimes(3)
        })

        it('calls delay (retries) twice', () => {
          expect(delay).toHaveBeenCalledTimes(2)
        })

        it.each([
          [1, streamLifespanTimeout],
          [2, streamLifespanTimeout],
          [3, streamLifespanTimeout],
        ] as const)('calls {} with the timeout {}', (position, timeoutMs) => {
          expect(operation).toHaveBeenNthCalledWith(
            position,
            expect.objectContaining({
              timeoutMs,
            }),
          )
        })

        it('reports the error in the stream', async () => {
          await expect(promise).rejects.toEqual(
            new ToValuesPromiseError(expect.anything(), [
              expect.objectContaining({
                attempt: 0,
                timeout: 100,
                type: 'error',
              }),
              expect.objectContaining({
                attempts: 1,
                timeout: 300,
                type: 'retry',
              }),
              expect.objectContaining({
                attempt: 1,
                timeout: 300,
                type: 'error',
              }),
              expect.objectContaining({
                attempts: 2,
                timeout: 900,
                type: 'retry',
              }),
            ]),
          )
        })
      })

      describe('non-retryable error', () => {
        async function* i(): AsyncGenerator<number> {
          yield await Promise.reject(new Error())
        }

        let operation: Mock<
          (options: AbortableOptions) => AsyncIterable<number>
        >
        class A {
          @streaming()
          op(options: AbortableOptions) {
            return operation(options)
          }
        }
        let a: A
        let c: ServiceOfAbortable<typeof a>

        let makeRetryable: Mock<() => CancellablePromise<boolean>>
        let promise: Promise<{ values: StreamedValue<number>[] }>

        beforeEach(async () => {
          makeRetryable = vi.fn(() => CancellablePromise.resolve(false))
          operation = vi.fn(() => i())
          a = new A()
          c = serviceOfAbortable(a, {
            __exitStreamingOnDone: true,
            delay,
            initialIdleTimeout: 100,
            makeRetryable,
            maxStreamingRetries: 2,
            timeoutBackoffMultiplier: 3,
          })
          promise = CancellablePromise.valuesFromIterable(c.op())
          await expect(promise).rejects.toBeDefined()
        })

        it('calls operation once', () => {
          expect(operation).toHaveBeenCalledOnce()
        })

        it('checks the error is retryable', () => {
          expect(makeRetryable).toHaveBeenCalledOnce()
        })

        it('does not delay (retry)', () => {
          expect(delay).not.toHaveBeenCalled()
        })

        it('reports the error in the stream', async () => {
          await expect(promise).rejects.toEqual(
            new ToValuesPromiseError(expect.anything(), []),
          )
        })
      })

      describe('success', () => {
        async function* i() {
          yield await Promise.resolve(1)
        }

        let operation: Mock<
          (options: AbortableOptions) => AsyncIterable<number>
        >
        class A {
          @streaming()
          op(options: AbortableOptions) {
            return operation(options)
          }
        }
        let a: A
        let c: ServiceOfAbortable<typeof a>

        let promise: Promise<{ values: StreamedValue<number>[] }>

        beforeEach(async () => {
          operation = vi.fn(() => i())
          a = new A()
          c = serviceOfAbortable(a, {
            __exitStreamingOnDone: true,
            delay,
            initialIdleTimeout: 100,
            maxStreamingRetries: 2,
            timeoutBackoffMultiplier: 3,
          })
          promise = CancellablePromise.valuesFromIterable(c.op())
          await promise
        })

        it('calls operation once', () => {
          expect(operation).toHaveBeenCalledOnce()
        })

        it('does not await', () => {
          expect(delay).not.toHaveBeenCalled()
        })

        it('reports the values', async () => {
          await expect(promise).resolves.toEqual(
            expect.objectContaining({
              values: expect.objectContaining([
                {
                  type: 'value',
                  value: 1,
                },
                // only happens when the stream can exit on done
                expect.objectContaining({
                  type: 'done',
                }),
              ]),
            }),
          )
        })
      })
    })
  })
})

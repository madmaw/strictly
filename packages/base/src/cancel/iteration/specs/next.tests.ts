import { expectInstanceOf } from '@strictly/vitest'
import { type CancellablePromiseDisposer } from 'cancel/Cancellable'
import {
  CancellableIterableCompletedError,
  CancellablePromise,
} from 'cancel/CancellablePromise'
import { type CancellableStep } from 'cancel/iteration/CancellableGenerator'
import { next } from 'cancel/iteration/next'

describe('next', () => {
  function* g() {
    yield 1
    yield CancellablePromise.resolve(2)
    return 'end'
  }

  it('returns each step', async () => {
    const i = g()
    expect(next(i)).toEqual(1)
    expect(await next(i)).toEqual(2)
  })

  it('throws the return value once done', () => {
    const i = g()
    i.next()
    i.next()
    let error: unknown
    try {
      void next(i)
    } catch (e) {
      error = e
    }
    expectInstanceOf(error, CancellableIterableCompletedError)
    expect(error.returnValue).toBe('end')
  })

  describe('TNext', () => {
    it('accepts iterators that can be resumed without a value', () => {
      function* inferred() {
        yield 1
      }
      function* resumedWithVoid(): Generator<number, void, void> {
        yield 1
      }
      function* optionalDisposer(): Generator<
        number,
        void,
        CancellablePromiseDisposer | undefined
      > {
        const cancel = yield 1
        cancel?.()
      }
      expect(next(inferred())).toEqual(1)
      expect(next(resumedWithVoid())).toEqual(1)
      expect(next(optionalDisposer())).toEqual(1)
    })

    it('rejects iterators that need a value', () => {
      expectTypeOf<
        Generator<number, void, CancellablePromiseDisposer>
      >().not.toExtend<Parameters<typeof next<number, void>>[0]>()
    })
  })

  it('keeps the step type', () => {
    expectTypeOf(next(g())).toEqualTypeOf<CancellableStep<number> | number>()
  })
})

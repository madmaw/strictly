import {
  CancellableIterableCompletedError,
  CancellablePromise,
} from 'cancel/CancellablePromise'
import { type CancellableStep } from 'cancel/iteration/CancellableIterable'
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
    expect(error).toBeInstanceOf(CancellableIterableCompletedError)
    expect(error).toHaveProperty('returnValue', 'end')
  })

  it('keeps the step type', () => {
    expectTypeOf(next(g())).toEqualTypeOf<CancellableStep<number> | number>()
  })
})

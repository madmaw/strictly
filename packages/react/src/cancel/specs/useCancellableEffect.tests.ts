import { CancellablePromise, Cancellation } from '@strictly/base'
import { renderHook } from '@testing-library/react'
import { useCancellableEffect } from 'cancel/useCancellableEffect'
import { type Mock } from 'vite-plus/test'

function delay() {
  return CancellablePromise.delay(100)
}

describe('useCancellablePromiseEffect', () => {
  let rerender: (n: number) => void
  let unmount: () => void
  let hookValue: number | undefined
  let effect: Mock<() => CancellablePromise<void>>
  let promises: CancellablePromise<void>[]
  beforeEach(() => {
    promises = []
    const value = renderHook((n: number) => {
      effect = vi.fn(() => {
        hookValue = n
        const promise = CancellablePromise.infinite()
        promises.push(promise)
        return promise
      })
      useCancellableEffect(effect, [n])
    })
    rerender = value.rerender
    unmount = value.unmount
  })

  afterEach(() => {
    unmount()
  })

  it('has 1 promise', () => {
    expect(promises).toHaveLength(1)
  })

  describe('render', () => {
    beforeEach(() => {
      rerender(1)
    })

    it('has 2 promises', () => {
      expect(promises).toHaveLength(2)
    })

    it('runs the effect', () => {
      expect(effect).toHaveBeenCalledOnce()
      expect(hookValue).toEqual(1)
    })

    describe('rerender', () => {
      beforeEach(async () => {
        rerender(2)
        await delay()
      })

      it('has the expected value', () => {
        expect(hookValue).toEqual(2)
      })

      it('has 3 promises', () => {
        expect(promises).toHaveLength(3)
      })

      it('cancels the old promise', async () => {
        await expect(promises[0]).rejects.toThrow(Cancellation)
      })
    })

    describe('unmount', () => {
      beforeEach(() => {
        unmount()
      })

      it('cancels the existing promise', async () => {
        await expect(promises[0]).rejects.toThrow(Cancellation)
      })
    })
  })
})

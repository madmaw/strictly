import { CancellableHelper, expectPendingPromise } from '@strictly/base'
import { renderHook } from '@testing-library/react'
import { useCancellableCallback } from 'cancel/useCancellableCallback'
import { useEffect } from 'react'
import { CancellablePromise, Cancellation } from 'real-cancellable-promise'
import { type Mock } from 'vite-plus/test'

function delay() {
  return CancellablePromise.delay(100)
}

describe('useCancellablePromiseCallback', () => {
  let rerender: (a: { n?: number; m?: number }) => void
  let unmount: () => void
  let accumulator: number
  let effect: Mock<(n: number) => CancellablePromise<void>>
  let promises: CancellablePromise<void>[]
  beforeEach(async () => {
    promises = []
    accumulator = 0
    const value = renderHook((a: { n?: number; m?: number } = {}) => {
      const { m = 1, n = 0 } = a
      effect = vi.fn((n: number) => {
        accumulator += n * m
        const promise = CancellableHelper.infinite()
        promises.push(promise)
        return promise
      })
      const callback = useCancellableCallback(effect, [m])
      useEffect(() => callback(n), [callback, n])
    })
    rerender = value.rerender
    unmount = value.unmount
    await delay()
  })

  afterEach(() => {
    unmount()
  })

  it('has 1 promise', () => {
    expect(promises).toHaveLength(1)
  })

  it('runs the effect', () => {
    expect(effect).toHaveBeenCalledTimes(1)
    expect(accumulator).toBe(0)
  })

  describe('render with changed dep', () => {
    beforeEach(async () => {
      rerender({
        m: 2,
        n: 1,
      })
      await delay()
    })

    it('has 2 promises', () => {
      expect(promises).toHaveLength(2)
    })

    it('has the expected value', () => {
      expect(accumulator).toEqual(2)
    })

    it('cancels the previous promise', async () => {
      await expect(promises[0]).rejects.toThrow(Cancellation)
    })

    describe('rerender with static dep', () => {
      beforeEach(async () => {
        rerender({ m: 2, n: 2 })
        await delay()
      })

      it('has the expected value', () => {
        expect(accumulator).toEqual(6)
      })

      it('has 3 promises', () => {
        expect(promises).toHaveLength(3)
      })

      // oxlint-disable-next-line vitest/expect-expect -- expectPendingPromise performs the assertion
      it('does not cancel the previous promise', async () => {
        await expectPendingPromise(promises[1])
      })
    })
  })

  describe('unmount', () => {
    beforeEach(() => {
      unmount()
    })

    it('cancels the existing promises', async () => {
      await expect(promises[0]).rejects.toThrow(Cancellation)
    })
  })
})

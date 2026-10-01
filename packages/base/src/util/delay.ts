import { CancellablePromise } from 'cancel/CancellablePromise'
import { Cancellation } from 'real-cancellable-promise'

export type Delay = () => CancellablePromise<void>

export function createDelay(millis = 100): Delay {
  return () => delay(millis)
}

export function delay(millis = 100): CancellablePromise<void> {
  return CancellablePromise.delay(millis)
}

export function infiniteDelay<T = void>(): CancellablePromise<T> {
  let doCancel: ((e: unknown) => void) | undefined
  return new CancellablePromise(
    new Promise((_res, rej) => {
      doCancel = rej
    }),
    () => {
      doCancel?.(new Cancellation('infinite cancelled'))
    },
  )
}

export function delayAnimationFrame(): CancellablePromise<number> {
  let frameHandle: number | undefined
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined
  let reject: (e: unknown) => void
  return new CancellablePromise(
    new Promise<number>((resolve, rej) => {
      reject = rej
      // base is environment independent; fall back to a macrotask when there is no animation frame
      // timer (e.g. under node)
      if (typeof requestAnimationFrame === 'function') {
        frameHandle = requestAnimationFrame(resolve)
      } else {
        timeoutHandle = setTimeout(() => resolve(Date.now()), 0)
      }
    }),
    () => {
      if (frameHandle != null) {
        cancelAnimationFrame(frameHandle)
      }
      if (timeoutHandle != null) {
        clearTimeout(timeoutHandle)
      }
      reject(new Cancellation('delayAnimationFrame'))
    },
  )
}

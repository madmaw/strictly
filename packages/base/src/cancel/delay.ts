import { CancellablePromise, Cancellation } from 'real-cancellable-promise'

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
  let handle: number
  let reject: (e: unknown) => void
  return new CancellablePromise(
    new Promise<number>((resolve, rej) => {
      handle = requestAnimationFrame(resolve)
      reject = rej
    }),
    () => {
      cancelAnimationFrame(handle)
      reject(new Cancellation('delayAnimationFrame'))
    },
  )
}

import { type CancellablePromise } from 'cancel/CancellablePromise'

export type CancellablePromiseDisposer = () => void

export type Cancellable<R> =
  | CancellablePromise<R>
  | Generator<unknown, R, CancellablePromiseDisposer>
  | R

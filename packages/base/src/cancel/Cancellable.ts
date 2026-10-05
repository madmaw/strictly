import { type CancellablePromise } from 'cancel/CancellablePromise'
import { type CancellableGenerator } from 'cancel/iteration/CancellableGenerator'

export type CancellablePromiseDisposer = () => void

export type Cancellable<R> =
  | CancellablePromise<R>
  | CancellableGenerator<unknown, R, CancellablePromiseDisposer>
  | R

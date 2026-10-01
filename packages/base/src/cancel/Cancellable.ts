import { type CancellablePromise } from 'cancel/CancellablePromise'
import { type LooseCancellableIterable } from 'cancel/iteration/CancellableIterable'

export type CancellablePromiseDisposer = () => void

export type Cancellable<R, I = unknown> =
  | CancellablePromise<R>
  | LooseCancellableIterable<I, R, CancellablePromiseDisposer>
  | R

import { type LooseCancellableIterable } from 'cancel/iteration/CancellableIterable'
import { type CancellablePromise } from 'real-cancellable-promise'

export type CancellablePromiseDisposer = () => void

export type Cancellable<R, I = unknown> =
  | CancellablePromise<R>
  | LooseCancellableIterable<I, R, CancellablePromiseDisposer>
  | R

import { AbortError } from 'cancel/AbortError'
import { Cancellation } from 'cancel/CancellablePromise'
import { FlowCancellationError } from 'mobx'

export const MOBX_CANCELLATION_ERROR_MESSAGE = 'WHEN_CANCELLED'

export function isCancellationError(e: unknown): boolean {
  return (
    (e instanceof Error && e.message === MOBX_CANCELLATION_ERROR_MESSAGE) ||
    e instanceof FlowCancellationError ||
    (e instanceof DOMException && e.name === AbortError.Name) ||
    e instanceof Cancellation ||
    (e instanceof Error && isCancellationError(e.cause))
  )
}

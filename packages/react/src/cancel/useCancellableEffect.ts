import { type Cancellable, CancellablePromise } from '@strictly/base'
import { type DependencyList, useEffect } from 'react'

/**
 * this hook will clean up the promise created by effect when the deps change or the calling component
 * is unmounted
 * @param effect an "effect" that returns a `CancellablePromise`
 * @param deps the deps for the supplied effect
 */
export function useCancellableEffect(
  effect: () => Cancellable<void>,
  deps: DependencyList,
) {
  useEffect(() => {
    const promise = CancellablePromise.ignoreCancellationErrors(
      // ignore cancellations in effects
      CancellablePromise.toPromise(effect()),
    )
    return () => promise.cancel()
    // oxlint-disable-next-line react/exhaustive-deps -- the deps are for effect, we pass through here
  }, deps)
}

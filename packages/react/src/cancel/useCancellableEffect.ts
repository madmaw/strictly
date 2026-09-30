import { type Cancellable, CancellableHelper } from '@strictly/base'
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
    const promise = CancellableHelper.ignoreCancellationErrors(
      // ignore cancellations in effects
      CancellableHelper.toPromise(effect()),
    )
    return () => promise.cancel()
    // oxlint-disable-next-line react/exhaustive-deps -- the deps are for effect, we pass through here
  }, deps)
}

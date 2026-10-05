import { type Cancellable, CancellablePromise } from '@strictly/base'
import { type DependencyList, useCallback, useEffect, useMemo } from 'react'
import { isPromiseWithCancel } from 'real-cancellable-promise'

function defaultCleanUpCancellablePromise<TReturn>(
  p: CancellablePromise<TReturn>,
) {
  p.cancel()
}

/**
 * Hook for ensuring that your async callbacks are cancelled when the component unmounts or the
 * deps change
 */
// oxlint-disable-next-line typescript/no-explicit-any -- any ok in generics
export function useCancellableCallback<A extends any[], TReturn>(
  cb: (...args: A) => Cancellable<TReturn>,
  deps: DependencyList,
  cleanUpPromise: (
    p: CancellablePromise<TReturn>,
  ) => void = defaultCleanUpCancellablePromise,
) {
  const promises = useMemo<CancellablePromise<TReturn>[]>(
    () => [],
    // oxlint-disable-next-line react/exhaustive-deps -- want to recreate this array every time the dependencies change
    deps,
  )
  const c = useCallback((...args: A) => {
    const result = cb(...args)
    const maybePromise = CancellablePromise.maybeFromCancellable(result)
    if (isPromiseWithCancel(maybePromise)) {
      void CancellablePromise.ignoreCancellationErrors(maybePromise)
      promises.push(maybePromise)
    }
    // oxlint-disable-next-line react/exhaustive-deps -- every time we run the callback make sure we can cancel it
  }, deps)
  useEffect(
    () => () => {
      promises.forEach(cleanUpPromise)
      promises.length = 0
    },
    [promises, cleanUpPromise],
  )
  return c
}

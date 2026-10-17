import { observer } from 'mobx-react'
import {
  type ComponentProps,
  type ComponentType,
  type DependencyList,
  useMemo,
} from 'react'

/**
 * `useCallback` for components that read observables: the returned component is an `observer` that is only recreated
 * when the deps change
 */
export function useObserver<T extends ComponentType<P>, P = ComponentProps<T>>(
  component: T,
  deps: DependencyList,
): T {
  // oxlint-disable-next-line react/exhaustive-deps -- the caller's deps are checked at the call site via additionalHooks
  return useMemo(() => observer(component), deps)
}

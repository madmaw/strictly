import { observer } from 'mobx-react'
import {
  type ComponentType,
  type DependencyList,
  type ForwardedRef,
  forwardRef,
  type PropsWithoutRef,
  useMemo,
} from 'react'

export function createSimplePartialComponent<
  ComponentProps,
  // TODO force curried props to be a struct subset of the component props
  CurriedProps extends Partial<ComponentProps> = Partial<ComponentProps>,
>(
  Component: ComponentType<ComponentProps>,
  curriedProps: CurriedProps,
) {
  return forwardRef(
    function (
      exposedProps: PropsWithoutRef<RemainingComponentProps<ComponentProps, CurriedProps>>,
      ref: ForwardedRef<typeof Component>,
    ) {
      // forward ref types are really difficult to work with
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any
      const C = Component as ComponentType<any>

      return (
        <C
          ref={ref}
          {...curriedProps}
          {...exposedProps}
        />
      )
    },
  )
}

export function createPartialComponent<
  ComponentProps,
  // TODO force curried props to be a struct subset of the component props
  CurriedProps extends Partial<ComponentProps> = Partial<ComponentProps>,
  AdditionalProps = {},
>(
  Component: ComponentType<ComponentProps>,
  curriedPropsSource: (additionalProps: AdditionalProps) => CurriedProps,
) {
  return forwardRef(
    function (
      exposedProps: PropsWithoutRef<RemainingComponentProps<ComponentProps, CurriedProps & AdditionalProps>>,
      ref: ForwardedRef<typeof Component>,
    ) {
      // forward ref types are really difficult to work with
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any
      const C = Component as ComponentType<any>
      // TODO is there any way we can memoize this transformation?
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const curriedProps = curriedPropsSource(exposedProps as AdditionalProps)

      return (
        <C
          ref={ref}
          {...curriedProps}
          {...exposedProps}
        />
      )
    },
  )
}

export function usePartialComponent<
  ComponentProps,
  // TODO force curried props to be a struct subset of the component props
  CurriedProps extends Partial<ComponentProps>,
  AdditionalProps = {},
>(
  // has to be first so eslint react-hooks/exhaustive-deps can find the callback
  // has to be a function so eslint react-hooks/exhaustive-deps can reason about it :(
  createCurriedProps: (additionalProps: AdditionalProps) => CurriedProps,
  // has to be next so eslint react-hooks/exhaustive-deps can find the deps
  deps: DependencyList,
  Component: ComponentType<ComponentProps>,
) {
  return useMemo(
    function () {
      return createPartialComponent(Component, createCurriedProps)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      // eslint-disable-next-line react-hooks/exhaustive-deps
      ...deps,
      Component,
    ],
  )
}

export function createPartialObserverComponent<
  ComponentProps,
  // TODO force curried props to be a struct subset of the component props
  CurriedProps extends Partial<ComponentProps>,
  AdditionalProps = {},
>(
  Component: ComponentType<ComponentProps>,
  curriedPropsSource: (additionalProps: AdditionalProps) => CurriedProps,
) {
  return observer(
    forwardRef(
      function (
        exposedProps: PropsWithoutRef<RemainingComponentProps<ComponentProps, CurriedProps> & AdditionalProps>,
        ref: ForwardedRef<typeof Component>,
      ) {
        // forward ref types are really difficult to work with
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any
        const C = Component as ComponentType<any>
        // TODO is there any way we can memoize this transformation?
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const curriedProps = curriedPropsSource(exposedProps as AdditionalProps)

        return (
          <C
            ref={ref}
            {...curriedProps}
            {...exposedProps}
          />
        )
      },
    ),
  )
}

export function usePartialObserverComponent<
  ComponentProps,
  CurriedProps extends Partial<ComponentProps>,
  AdditionalProps = {},
>(
  // has to be first so eslint react-hooks/exhaustive-deps can find the callback
  curriedPropsSource: (additionalProps: AdditionalProps) => CurriedProps,
  // has to be next so eslint react-hooks/exhaustive-deps can find the deps
  deps: DependencyList,
  Component: ComponentType<ComponentProps>,
) {
  return useMemo(
    function () {
      return createPartialObserverComponent(Component, curriedPropsSource)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      // eslint-disable-next-line react-hooks/exhaustive-deps
      ...deps,
      Component,
    ],
  )
}

type RemainingComponentProps<ComponentProps, CurriedProps> =
  & Omit<ComponentProps, keyof CurriedProps>
  & JSX.IntrinsicAttributes

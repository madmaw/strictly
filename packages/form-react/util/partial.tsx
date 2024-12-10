import { observer } from 'mobx-react'
import {
  type ComponentProps,
  type ComponentType,
  type DependencyList,
  type ForwardedRef,
  forwardRef,
  type ForwardRefExoticComponent,
  type PropsWithoutRef,
  useMemo,
} from 'react'

export type PartialComponent<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Component extends ComponentType<any>,
  CurriedProps,
  AdditionalProps = {},
> = Exclude<keyof CurriedProps, keyof ComponentProps<Component>> extends never
  ? UnsafePartialComponent<Component, CurriedProps, AdditionalProps>
  : keyof CurriedProps extends (string | number)
    ? `unmatched prop: ${Exclude<keyof CurriedProps, keyof ComponentProps<Component>>}`
  : Exclude<keyof CurriedProps, keyof ComponentProps<Component>>

export type UnsafePartialComponent<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Component extends ComponentType<any>,
  CurriedProps,
  AdditionalProps = {},
> = ForwardRefExoticComponent<
  PropsWithoutRef<RemainingComponentProps<Component, CurriedProps> & AdditionalProps>
>

export function createSimplePartialComponent<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Component extends ComponentType<any>,
  CurriedProps extends Partial<ComponentProps<Component>>,
>(
  Component: Component,
  curriedProps: CurriedProps,
): PartialComponent<Component, CurriedProps> {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return forwardRef(
    function (
      exposedProps: PropsWithoutRef<RemainingComponentProps<Component, CurriedProps>>,
      ref: ForwardedRef<typeof Component>,
    ) {
      // forward ref types are really difficult to work with
      // still needs a cast as `extends ComponentType<any>` != `ComponentType<any>`
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unnecessary-type-assertion
      const C = Component as ComponentType<any>

      return (
        <C
          ref={ref}
          {...curriedProps}
          {...exposedProps}
        />
      )
    },
  ) as PartialComponent<Component, CurriedProps>
}

export function createPartialComponent<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Component extends ComponentType<any>,
  CurriedProps extends Partial<ComponentProps<Component>>,
  AdditionalProps = {},
>(
  Component: Component,
  curriedPropsSource: (additionalProps: AdditionalProps) => CurriedProps,
): PartialComponent<Component, CurriedProps, AdditionalProps> {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return forwardRef(
    function (
      exposedProps: PropsWithoutRef<RemainingComponentProps<Component, CurriedProps> & AdditionalProps>,
      ref: ForwardedRef<typeof Component>,
    ) {
      // forward ref types are really difficult to work with
      // still needs a cast as `extends ComponentType<any>` != `ComponentType<any>`
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unnecessary-type-assertion
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
  ) as PartialComponent<Component, CurriedProps, AdditionalProps>
}

export function usePartialComponent<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Component extends ComponentType<any>,
  CurriedProps extends Partial<ComponentProps<Component>>,
  AdditionalProps = {},
>(
  // has to be first so eslint react-hooks/exhaustive-deps can find the callback
  // has to be a function so eslint react-hooks/exhaustive-deps can reason about it :(
  createCurriedProps: (additionalProps: AdditionalProps) => CurriedProps,
  // has to be next so eslint react-hooks/exhaustive-deps can find the deps
  deps: DependencyList,
  Component: Component,
): PartialComponent<Component, CurriedProps, AdditionalProps> {
  return useMemo(
    function () {
      return createPartialComponent<Component, CurriedProps, AdditionalProps>(Component, createCurriedProps)
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Component extends ComponentType<any>,
  CurriedProps extends Partial<ComponentProps<Component>>,
  AdditionalProps = {},
>(
  Component: Component,
  curriedPropsSource: (additionalProps: AdditionalProps) => CurriedProps,
): PartialComponent<Component, CurriedProps, AdditionalProps> {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return createUnsafePartialObserverComponent(Component, curriedPropsSource) as PartialComponent<Component,
    CurriedProps, AdditionalProps>
}

export function createUnsafePartialObserverComponent<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Component extends ComponentType<any>,
  CurriedProps,
  AdditionalProps = {},
>(
  Component: Component,
  curriedPropsSource: (additionalProps: AdditionalProps) => CurriedProps,
): UnsafePartialComponent<Component, CurriedProps, AdditionalProps> {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return observer(
    forwardRef(
      function (
        exposedProps: PropsWithoutRef<RemainingComponentProps<Component, CurriedProps> & AdditionalProps>,
        ref: ForwardedRef<typeof Component>,
      ) {
        // forward ref types are really difficult to work with
        // still needs a cast as `extends ComponentType<any>` != `ComponentType<any>`
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unnecessary-type-assertion
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
  ) as UnsafePartialComponent<Component, CurriedProps, AdditionalProps>
}

export function usePartialObserverComponent<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Component extends ComponentType<any>,
  CurriedProps extends Partial<ComponentProps<Component>>,
  AdditionalProps = {},
>(
  // has to be first so eslint react-hooks/exhaustive-deps can find the callback
  curriedPropsSource: (additionalProps: AdditionalProps) => CurriedProps,
  // has to be next so eslint react-hooks/exhaustive-deps can find the deps
  deps: DependencyList,
  Component: Component,
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

type RemainingComponentProps<Component extends ComponentType, CurriedProps> =
  & Omit<ComponentProps<Component>, keyof CurriedProps>
  & JSX.IntrinsicAttributes

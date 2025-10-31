import { type FriendlyExhaustiveArrayOfUnion } from '@strictly/base'
import { Observer } from 'mobx-react'
import {
  type ComponentProps,
  type ComponentType,
  type DependencyList,
  type ForwardedRef,
  forwardRef,
  type ForwardRefExoticComponent,
  type PropsWithoutRef,
  type Ref,
  type RefAttributes,
  useMemo,
} from 'react'

export type RefOfProps<P, Fallback = unknown> = P extends RefAttributes<infer R> ? R : Fallback

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
  R = RefOfProps<ComponentProps<Component>>,
> = ForwardRefExoticComponent<
  PropsWithoutRef<RemainingComponentProps<Component, CurriedProps> & AdditionalProps> & {
    ref?: Ref<R>,
  }
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
  CurriedProps,
>(
  Component: Component,
  curriedPropsSource: () => CurriedProps,
): PartialComponent<Component, CurriedProps, {}>
export function createPartialComponent<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Component extends ComponentType<any>,
  CurriedProps,
  AdditionalProps,
  AllAdditionalPropKeys extends readonly (keyof AdditionalProps)[],
>(
  Component: Component,
  curriedPropsSource: (additionalProps: AdditionalProps) => CurriedProps,
  additionalPropKeys: FriendlyExhaustiveArrayOfUnion<keyof AdditionalProps, AllAdditionalPropKeys>,
): PartialComponent<Component, CurriedProps, AdditionalProps>
export function createPartialComponent<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Component extends ComponentType<any>,
  CurriedProps extends Partial<ComponentProps<Component>>,
  AdditionalProps,
>(
  Component: Component,
  curriedPropsSource: (additionalProps: AdditionalProps) => CurriedProps,
  additionalPropKeys: readonly (keyof AdditionalProps)[] = [],
): PartialComponent<Component, CurriedProps, AdditionalProps> {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return forwardRef(
    function (
      props: PropsWithoutRef<RemainingComponentProps<Component, CurriedProps> & AdditionalProps>,
      ref: ForwardedRef<typeof Component>,
    ) {
      // forward ref types are really difficult to work with
      // still needs a cast as `extends ComponentType<any>` != `ComponentType<any>`
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unnecessary-type-assertion
      const C = Component as ComponentType<any>
      const [
        additionalProps,
        exposedProps,
      ] = additionalPropKeys.reduce<[AdditionalProps, RemainingComponentProps<Component, CurriedProps>]>(
        function (
          [
            additionalProps,
            exposedProps,
          ],
          key,
        ) {
          const value = props[
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            key as keyof PropsWithoutRef<RemainingComponentProps<Component, CurriedProps> & AdditionalProps>
          ]
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          delete exposedProps[key as keyof RemainingComponentProps<Component, CurriedProps>]
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any
          additionalProps[key] = value as any
          return [
            additionalProps,
            exposedProps,
          ]
        },
        [
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          {} as AdditionalProps,
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          { ...props } as RemainingComponentProps<Component, CurriedProps>,
        ],
      )

      // TODO is there any way we can memoize this transformation?
      const curriedProps = curriedPropsSource(additionalProps)

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
  CurriedProps,
>(
  curriedPropsSource: () => CurriedProps,
  deps: DependencyList,
  Component: Component,
): PartialComponent<Component, CurriedProps, {}>
export function usePartialComponent<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Component extends ComponentType<any>,
  CurriedProps,
  AdditionalProps,
  AllAdditionalPropKeys extends readonly (keyof AdditionalProps)[],
>(
  curriedPropsSource: (additionalProps: AdditionalProps) => CurriedProps,
  deps: DependencyList,
  Component: Component,
  additionalPropKeys: FriendlyExhaustiveArrayOfUnion<keyof AdditionalProps, AllAdditionalPropKeys>,
): PartialComponent<Component, CurriedProps, AdditionalProps>
export function usePartialComponent<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Component extends ComponentType<any>,
  CurriedProps extends Partial<ComponentProps<Component>>,
  AdditionalProps,
>(
  // has to be first so eslint react-hooks/exhaustive-deps can find the callback
  // has to be a function so eslint react-hooks/exhaustive-deps can reason about it :(
  curriedPropsSource: (additionalProps: AdditionalProps) => CurriedProps,
  // has to be next so eslint react-hooks/exhaustive-deps can find the deps
  deps: DependencyList,
  Component: Component,
  additionalPropKeys: readonly (keyof AdditionalProps)[] = [],
): PartialComponent<Component, CurriedProps, AdditionalProps> {
  return useMemo(
    function () {
      return createPartialComponent(
        Component,
        curriedPropsSource,
        additionalPropKeys,
      )
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      // eslint-disable-next-line react-hooks/exhaustive-deps
      ...deps,
      Component,
      // eslint-disable-next-line react-hooks/exhaustive-deps
      ...additionalPropKeys,
    ],
  )
}

export function createPartialObserverComponent<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Component extends ComponentType<any>,
  CurriedProps,
>(
  Component: Component,
  curriedPropsSource: () => CurriedProps,
): PartialComponent<Component, CurriedProps, {}>
export function createPartialObserverComponent<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Component extends ComponentType<any>,
  CurriedProps,
  AdditionalProps,
  AllAdditionalPropKeys extends readonly (keyof AdditionalProps)[],
>(
  Component: Component,
  curriedPropsSource: (additionalProps: AdditionalProps) => CurriedProps,
  additionalPropKeys: FriendlyExhaustiveArrayOfUnion<keyof AdditionalProps, AllAdditionalPropKeys>,
): PartialComponent<Component, CurriedProps, AdditionalProps>
export function createPartialObserverComponent<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Component extends ComponentType<any>,
  CurriedProps extends Partial<ComponentProps<Component>>,
  AdditionalProps,
>(
  Component: Component,
  curriedPropsSource: (additionalProps: AdditionalProps) => CurriedProps,
  additionalPropKeys: readonly (keyof AdditionalProps)[] = [],
): PartialComponent<Component, CurriedProps, AdditionalProps> {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return createUnsafePartialObserverComponent(
    Component,
    curriedPropsSource,
    additionalPropKeys,
  ) as PartialComponent<Component, CurriedProps, AdditionalProps>
}

export function createUnsafePartialObserverComponent<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Component extends ComponentType<any>,
  CurriedProps,
>(
  Component: Component,
  curriedPropsSource: () => CurriedProps,
): UnsafePartialComponent<Component, CurriedProps, {}>
export function createUnsafePartialObserverComponent<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Component extends ComponentType<any>,
  CurriedProps,
  AdditionalProps,
  AllAdditionalPropKeys extends readonly (keyof AdditionalProps)[],
>(
  Component: Component,
  curriedPropsSource: (additionalProps: AdditionalProps) => CurriedProps,
  additionalPropKeys: FriendlyExhaustiveArrayOfUnion<keyof AdditionalProps, AllAdditionalPropKeys>,
): UnsafePartialComponent<Component, CurriedProps, AdditionalProps>
export function createUnsafePartialObserverComponent<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Component extends ComponentType<any>,
  CurriedProps,
  AdditionalProps = {},
>(
  Component: Component,
  curriedPropsSource: (additionalProps?: AdditionalProps) => CurriedProps,
  additionalPropKeys: readonly (keyof AdditionalProps)[] = [],
): UnsafePartialComponent<Component, CurriedProps, AdditionalProps> {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return forwardRef(
    function (
      props: PropsWithoutRef<RemainingComponentProps<Component, CurriedProps> & AdditionalProps>,
      ref: ForwardedRef<typeof Component>,
    ) {
      // forward ref types are really difficult to work with
      // still needs a cast as `extends ComponentType<any>` != `ComponentType<any>`
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unnecessary-type-assertion
      const C = Component as ComponentType<any>
      // remove the additional props from the exposed props that get passed in to the component
      // as this generates react warnings
      const [
        additionalProps,
        exposedProps,
      ] = additionalPropKeys.reduce<[AdditionalProps, RemainingComponentProps<Component, CurriedProps>]>(
        function (
          [
            additionalProps,
            exposedProps,
          ],
          key,
        ) {
          const value = props[
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            key as keyof PropsWithoutRef<RemainingComponentProps<Component, CurriedProps> & AdditionalProps>
          ]
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          delete exposedProps[key as keyof RemainingComponentProps<Component, CurriedProps>]
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any
          additionalProps[key] = value as any
          return [
            additionalProps,
            exposedProps,
          ]
        },
        [
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          {} as AdditionalProps,
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          { ...props } as RemainingComponentProps<Component, CurriedProps>,
        ],
      )
      return (
        <Observer>
          {() => {
            // TODO is there any way we can memoize this transformation?
            const curriedProps = curriedPropsSource(additionalProps)

            return (
              <C
                ref={ref}
                {...curriedProps}
                {...exposedProps}
              />
            )
          }}
        </Observer>
      )
    },
  ) as UnsafePartialComponent<Component, CurriedProps, AdditionalProps>
}

export function usePartialObserverComponent<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Component extends ComponentType<any>,
  CurriedProps,
>(
  curriedPropsSource: () => CurriedProps,
  deps: DependencyList,
  Component: Component,
): PartialComponent<Component, CurriedProps, {}>
export function usePartialObserverComponent<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Component extends ComponentType<any>,
  CurriedProps,
  AdditionalProps,
  AllAdditionalPropKeys extends readonly (keyof AdditionalProps)[],
>(
  curriedPropsSource: (additionalProps: AdditionalProps) => CurriedProps,
  deps: DependencyList,
  Component: Component,
  additionalPropKeys: FriendlyExhaustiveArrayOfUnion<keyof AdditionalProps, AllAdditionalPropKeys>,
): PartialComponent<Component, CurriedProps, AdditionalProps>
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
  additionalPropKeys: readonly (keyof AdditionalProps)[] = [],
): PartialComponent<Component, CurriedProps, AdditionalProps> {
  return useMemo(
    function () {
      return createPartialObserverComponent(
        Component,
        curriedPropsSource,
        additionalPropKeys,
      )
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      // eslint-disable-next-line react-hooks/exhaustive-deps
      ...deps,
      Component,
      // eslint-disable-next-line react-hooks/exhaustive-deps
      ...additionalPropKeys,
    ],
  )
}

type RemainingComponentProps<Component extends ComponentType, CurriedProps> =
  & Omit<ComponentProps<Component>, keyof CurriedProps>
  & JSX.IntrinsicAttributes

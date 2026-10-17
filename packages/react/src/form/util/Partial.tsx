import { type FriendlyExhaustiveArrayOfUnion } from '@strictly/base'
import { Observer } from 'mobx-react'
import {
  type ComponentProps,
  type ComponentType,
  type ForwardedRef,
  forwardRef,
  type ForwardRefExoticComponent,
  type JSX,
  type PropsWithoutRef,
  type Ref,
  type RefAttributes,
} from 'react'

export type RefOfProps<P, Fallback = unknown> =
  P extends RefAttributes<infer R> ? R : Fallback

export type PartialComponent<
  // oxlint-disable-next-line typescript/no-explicit-any
  Component extends ComponentType<any>,
  CurriedProps,
  AdditionalProps = {},
> =
  Exclude<keyof CurriedProps, keyof ComponentProps<Component>> extends never
    ? UnsafePartialComponent<Component, CurriedProps, AdditionalProps>
    : keyof CurriedProps extends string | number
      ? `unmatched prop: ${Exclude<keyof CurriedProps, keyof ComponentProps<Component>>}`
      : Exclude<keyof CurriedProps, keyof ComponentProps<Component>>

export type UnsafePartialComponent<
  // oxlint-disable-next-line typescript/no-explicit-any
  Component extends ComponentType<any>,
  CurriedProps,
  AdditionalProps = {},
  R = RefOfProps<ComponentProps<Component>>,
> = ForwardRefExoticComponent<
  PropsWithoutRef<
    RemainingComponentProps<Component, CurriedProps> & AdditionalProps
  > & {
    ref?: Ref<R>
  }
>

export function createUnsafePartialObserverComponent<
  // oxlint-disable-next-line typescript/no-explicit-any
  Component extends ComponentType<any>,
  CurriedProps,
>(
  Component: Component,
  curriedPropsSource: () => CurriedProps,
): UnsafePartialComponent<Component, CurriedProps, {}>
export function createUnsafePartialObserverComponent<
  // oxlint-disable-next-line typescript/no-explicit-any
  Component extends ComponentType<any>,
  CurriedProps,
  AdditionalProps,
  AllAdditionalPropKeys extends readonly (keyof AdditionalProps)[],
>(
  Component: Component,
  curriedPropsSource: (additionalProps: AdditionalProps) => CurriedProps,
  additionalPropKeys: FriendlyExhaustiveArrayOfUnion<
    keyof AdditionalProps,
    AllAdditionalPropKeys
  >,
): UnsafePartialComponent<Component, CurriedProps, AdditionalProps>
export function createUnsafePartialObserverComponent<
  // oxlint-disable-next-line typescript/no-explicit-any
  Component extends ComponentType<any>,
  CurriedProps,
  AdditionalProps = {},
>(
  Component: Component,
  curriedPropsSource: (additionalProps?: AdditionalProps) => CurriedProps,
  additionalPropKeys: readonly (keyof AdditionalProps)[] = [],
): UnsafePartialComponent<Component, CurriedProps, AdditionalProps> {
  return forwardRef(
    (
      props: PropsWithoutRef<
        RemainingComponentProps<Component, CurriedProps> & AdditionalProps
      >,
      ref: ForwardedRef<typeof Component>,
    ) => {
      // forward ref types are really difficult to work with
      // still needs a cast as `extends ComponentType<any>` != `ComponentType<any>`
      // oxlint-disable-next-line typescript/no-unnecessary-type-assertion, typescript/no-explicit-any -- tsc disagrees with the linter here
      const C = Component as ComponentType<any>
      // remove the additional props from the exposed props that get passed in to the component
      // as this generates react warnings
      const [additionalProps, exposedProps] = additionalPropKeys.reduce<
        [AdditionalProps, RemainingComponentProps<Component, CurriedProps>]
      >(
        ([additionalProps, exposedProps], key) => {
          const value =
            props[
              key as keyof PropsWithoutRef<
                RemainingComponentProps<Component, CurriedProps> &
                  AdditionalProps
              >
            ]
          delete exposedProps[
            key as keyof RemainingComponentProps<Component, CurriedProps>
          ]
          // oxlint-disable-next-line typescript/no-explicit-any
          additionalProps[key] = value as any
          return [additionalProps, exposedProps]
        },
        [
          // oxlint-disable-next-line typescript/consistent-type-assertions
          {} as AdditionalProps,
          // oxlint-disable-next-line typescript/consistent-type-assertions
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

type RemainingComponentProps<
  Component extends ComponentType,
  CurriedProps,
> = Omit<ComponentProps<Component>, keyof CurriedProps> &
  JSX.IntrinsicAttributes

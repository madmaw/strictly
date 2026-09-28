import { type StringConcatOf } from '@strictly/base'
import {
  jsonPathPrefix,
  jsonPathUnprefix,
} from '@strictly/define'
import type { FieldsViewProps } from 'core/props'
import { observer } from 'mobx-react'
import type {
  ComponentProps,
  ComponentType,
} from 'react'
import type { AllFieldsOfFields } from 'types/AllFieldsOfFields'
import type { Fields } from 'types/Field'
import type { SubFormFields } from 'types/SubFormFields'
import type { ValueTypeOfField } from 'types/ValueTypeOfField'
import type { MantineFieldComponent } from './types'

export type SubPathsOf<ValuePath extends string, SubFormValuePath extends string> = SubFormValuePath extends
  StringConcatOf<ValuePath, infer Postfix> ? `$${Postfix}`
  : never

export type CallbackMapper<ValuePath extends string> = {
  <
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Cb extends (...args: any[]) => any,
  >(cb: Cb): Parameters<Cb> extends [infer SubFormValuePath extends string, ...(infer Rest)] ? (
      valuePath: SubPathsOf<ValuePath, SubFormValuePath>,
      ...rest: Rest
    ) => ReturnType<Cb>
    : never,
}

export type FieldsView<
  ValuePath extends string = string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  C extends ComponentType<any> = ComponentType<any>,
> = {
  Component: C,
  callbackMapper: CallbackMapper<ValuePath>,
}

export function createFieldsView<
  F extends Fields,
  K extends keyof AllFieldsOfFields<F>,
  P extends FieldsViewProps<Fields> = FieldsViewProps<SubFormFields<F, K>>,
>(
  valuePath: K,
  FieldsView: ComponentType<P>,
  observableProps: FieldsViewProps<F>,
): FieldsView<K, MantineFieldComponent<FieldsViewProps<P['fields']>, P, never>> {
  function toKey(subKey: string | number | symbol): string {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return jsonPathPrefix(valuePath, subKey as string)
  }

  function toSubKey(key: string | number | symbol): string {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return jsonPathUnprefix(valuePath, key as string)
  }

  function onFieldValueChange<SubK extends keyof P['fields']>(
    subKey: SubK,
    value: ValueTypeOfField<P['fields'][SubK]>,
  ) {
    // convert from subKey to key
    observableProps.onFieldValueChange(toKey(subKey), value)
  }
  function onFieldBlur(subKey: keyof P['fields']) {
    observableProps.onFieldBlur?.(toKey(subKey))
  }

  function onFieldFocus(subKey: keyof P['fields']) {
    observableProps.onFieldFocus?.(toKey(subKey))
  }

  function onFieldSubmit(subKey: keyof P['fields']) {
    observableProps.onFieldSubmit?.(toKey(subKey))
  }

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const Component = observer(
    function (props: ComponentProps<MantineFieldComponent<FieldsViewProps<P['fields']>, P, never>>) {
      // convert fields to sub-fields
      const subFields = Object.entries(observableProps.fields).reduce<Record<string, unknown>>(
        (acc, [
          fieldKey,
          fieldValue,
        ]) => {
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          if (fieldKey.startsWith(valuePath as string)) {
            acc[toSubKey(fieldKey)] = fieldValue
          }
          return acc
        },
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        {} as P['fields'],
      )

      return (
        <FieldsView
          {
            // maybe we can do this in a more type safe way
            // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/consistent-type-assertions
            ...props as any
          }
          fields={subFields}
          onFieldBlur={onFieldBlur}
          onFieldFocus={onFieldFocus}
          onFieldSubmit={onFieldSubmit}
          onFieldValueChange={onFieldValueChange}
        />
      )
    },
  ) as unknown as MantineFieldComponent<FieldsViewProps<P['fields']>, P, never>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/consistent-type-assertions
  const callbackMapper: CallbackMapper<K> = ((callback: (valuePath: string, ...args: any[]) => any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (subFormValuePath: string, ...args: any[]) => {
      const valuePath = toKey(subFormValuePath)
      return callback(valuePath, ...args)
    }
  }) as CallbackMapper<K>
  return {
    Component,
    callbackMapper,
  }
}

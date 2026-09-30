import {
  jsonPathPrefix,
  jsonPathUnprefix,
  type StringConcatOf,
  type StringKeyOf,
} from '@strictly/base'
import type { FieldsViewProps } from 'form/core/props'
import type { Fields } from 'form/types/Field'
import type { SubFormFields } from 'form/types/SubFormFields'
import type { ValueTypeOfField } from 'form/types/ValueTypeOfField'
import { observer } from 'mobx-react'
import type { ComponentProps, ComponentType } from 'react'
import type { MantineFieldComponent } from './types'

export type SubPathsOf<
  ValuePath extends string,
  SubFormValuePath extends string,
> =
  SubFormValuePath extends StringConcatOf<ValuePath, infer Postfix>
    ? `$${Postfix}`
    : never

export type CallbackMapper<ValuePath extends string> = <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Cb extends (...args: any[]) => any,
>(
  cb: Cb,
) => Parameters<Cb> extends [
  infer SubFormValuePath extends string,
  ...infer Rest,
]
  ? (
      valuePath: SubPathsOf<ValuePath, SubFormValuePath>,
      ...rest: Rest
    ) => ReturnType<Cb>
  : never

export type FieldsView<
  ValuePath extends string = string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  C extends ComponentType<any> = ComponentType<any>,
> = {
  Component: C
  callbackMapper: CallbackMapper<ValuePath>
}

export function createFieldsView<
  F extends Fields,
  K extends StringKeyOf<F>,
  P extends FieldsViewProps<Fields> = FieldsViewProps<SubFormFields<F, K>>,
>(
  valuePath: K,
  FieldsView: ComponentType<P>,
  observableProps: FieldsViewProps<F>,
): FieldsView<
  K,
  MantineFieldComponent<FieldsViewProps<P['fields']>, P, never>
> {
  function toKey(subKey: string | number | symbol): string {
    return jsonPathPrefix(valuePath, subKey as string)
  }

  function toSubKey(key: string | number | symbol): string {
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

  const Component = observer(
    (
      props: ComponentProps<
        MantineFieldComponent<FieldsViewProps<P['fields']>, P, never>
      >,
    ) => {
      // convert fields to sub-fields
      const subFields = Object.entries(observableProps.fields).reduce<
        Record<string, unknown>
      >(
        (acc, [fieldKey, fieldValue]) => {
          if (fieldKey.startsWith(valuePath)) {
            acc[toSubKey(fieldKey)] = fieldValue
          }
          return acc
        },
        {} as P['fields'],
      )

      return (
        <FieldsView
          {
            // maybe we can do this in a more type safe way
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ...(props as any)
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
  const callbackMapper: CallbackMapper<K> = ((
    callback: (valuePath: string, ...args: any[]) => any, // oxlint-disable-line typescript/no-explicit-any
  ) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (subFormValuePath: string, ...args: any[]) => {
      const valuePath = toKey(subFormValuePath)
      return callback(valuePath, ...args)
    }) as CallbackMapper<K>
  return {
    Component,
    callbackMapper,
  }
}

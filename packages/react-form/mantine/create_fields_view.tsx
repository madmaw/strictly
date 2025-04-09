import { type StringConcatOf } from '@strictly/base'
import type { FieldsViewProps } from 'core/props'
import { observer } from 'mobx-react'
import type {
  ComponentProps,
  ComponentType,
} from 'react'
import type { AllFieldsOfFields } from 'types/all_fields_of_fields'
import type { Fields } from 'types/field'
import type { SubFormFields } from 'types/sub_form_fields'
import type { ValueTypeOfField } from 'types/value_type_of_field'
import type { MantineFieldComponent } from './types'

export type CallbackMapper<ValuePath extends string> = {
  <
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Cb extends (...args: any[]) => any,
  >(cb: Cb): Parameters<Cb> extends [infer SubFormValuePath extends string, ...(infer Rest)]
    ? SubFormValuePath extends StringConcatOf<ValuePath, infer Postfix>
      ? (valuePath: `$${Postfix}`, ...rest: Rest) => ReturnType<Cb>
    : never
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
    return (subKey as string).replace('$', valuePath as string)
  }

  function toSubKey(key: string | number | symbol): string {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return (key as string).replace(valuePath as string, '$')
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

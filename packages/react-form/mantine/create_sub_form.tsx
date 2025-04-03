import type { FormProps } from 'core/props'
import { observer } from 'mobx-react'
import type { ComponentType } from 'react'
import type { AllFieldsOfFields } from 'types/all_fields_of_fields'
import type { Fields } from 'types/field'
import type { SubFormFields } from 'types/sub_form_fields'
import type { ValueTypeOfField } from 'types/value_type_of_field'

export function createSubForm<
  F extends Fields,
  K extends keyof AllFieldsOfFields<F>,
  S extends Fields = SubFormFields<F, K>,
>(
  valuePath: K,
  SubForm: ComponentType<FormProps<S>>,
  observableProps: FormProps<F>,
) {
  function toKey(subKey: string | number | symbol): string {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return (subKey as string).replace('$', valuePath as string)
  }

  function toSubKey(key: string | number | symbol): string {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return (key as string).replace(valuePath as string, '$')
  }

  function onFieldValueChange<SubK extends keyof S>(
    subKey: SubK,
    value: ValueTypeOfField<S[SubK]>,
  ) {
    // convert from subKey to key
    observableProps.onFieldValueChange(toKey(subKey), value)
  }
  function onFieldBlur(subKey: keyof S) {
    observableProps.onFieldBlur?.(toKey(subKey))
  }

  function onFieldFocus(subKey: keyof S) {
    observableProps.onFieldFocus?.(toKey(subKey))
  }

  function onFieldSubmit(subKey: keyof S) {
    observableProps.onFieldSubmit?.(toKey(subKey))
  }
  return observer(function () {
    // convert fields to sub-fields
    const subFields = Object.entries(observableProps.fields).reduce<Record<string, unknown>>((acc, [
      fieldKey,
      fieldValue,
    ]) => {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      if (fieldKey.startsWith(valuePath as string)) {
        acc[toSubKey(fieldKey)] = fieldValue
      }
      return acc
    }, {})

    return (
      <SubForm
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        fields={subFields as S}
        onFieldBlur={onFieldBlur}
        onFieldFocus={onFieldFocus}
        onFieldSubmit={onFieldSubmit}
        onFieldValueChange={onFieldValueChange}
      />
    )
  })
}

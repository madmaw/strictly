import {
  type CheckboxProps,
} from '@mantine/core'
import { type ComponentType } from 'react'
import { type BooleanFieldsOfFields } from 'types/boolean_fields_of_fields'
import { type ErrorTypeOfField } from 'types/error_type_of_field'
import { type Fields } from 'types/field'
import { createUnsafePartialObserverComponent } from 'util/partial'
import { type ErrorRenderer } from './hooks'
import {
  type MantineFieldComponent,
  type MantineForm,
} from './types'

export type SuppliedCheckboxProps = Pick<
  CheckboxProps,
  | 'name'
  | 'checked'
  | 'disabled'
  | 'required'
  | 'error'
  | 'onChange'
  | 'onFocus'
  | 'onBlur'
  | 'onKeyUp'
>

export function createCheckbox<
  F extends Fields,
  K extends keyof BooleanFieldsOfFields<F>,
  Props extends SuppliedCheckboxProps,
>(
  this: MantineForm<F>,
  valuePath: K,
  Checkbox: ComponentType<Props>,
  ErrorRenderer: ErrorRenderer<ErrorTypeOfField<F[K]>>,
): MantineFieldComponent<SuppliedCheckboxProps, Props> {
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.onFieldValueChange?.(valuePath, e.target.checked)
  }
  const onFocus = () => {
    this.onFieldFocus?.(valuePath)
  }
  const onBlur = () => {
    this.onFieldBlur?.(valuePath)
  }
  const onKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (this.onFieldSubmit?.(valuePath)) {
        e.preventDefault()
      }
    }
  }

  const propSource = () => {
    const {
      disabled,
      required,
      value,
      error,
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    } = this.fields[valuePath as string]
    return {
      name: valuePath,
      checked: value,
      disabled,
      required,
      error: error && <ErrorRenderer error={error} />,
      onChange,
      onFocus,
      onBlur,
      onKeyUp,
    }
  }
  return createUnsafePartialObserverComponent<typeof Checkbox, SuppliedCheckboxProps>(
    Checkbox,
    propSource,
  )
}

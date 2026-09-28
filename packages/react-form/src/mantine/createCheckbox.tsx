import { type CheckboxProps } from '@mantine/core'
import { type ComponentType } from 'react'
import { type BooleanFieldsOfFields } from 'types/BooleanFieldsOfFields'
import { type ErrorOfField } from 'types/ErrorOfField'
import { type Fields } from 'types/Field'
import { createUnsafePartialObserverComponent } from 'util/Partial'
import { DefaultErrorRenderer, type ErrorRenderer } from './ErrorRenderer'
import { type MantineFieldComponent, type MantineForm } from './types'

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
): MantineFieldComponent<SuppliedCheckboxProps, Props, ErrorOfField<F[K]>> {
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.onFieldValueChange(valuePath, e.target.checked)
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

  const propSource = ({
    ErrorRenderer = DefaultErrorRenderer,
  }: {
    ErrorRenderer?: ErrorRenderer<ErrorOfField<F[K]>>
  }) => {
    const { readonly, required, value, error } =
      this.fields[valuePath as string]
    return {
      name: valuePath,
      checked: value,
      disabled: readonly,
      required,
      error: error == null ? null : <ErrorRenderer error={error} />,
      onChange,
      onFocus,
      onBlur,
      onKeyUp,
    }
  }
  return createUnsafePartialObserverComponent(Checkbox, propSource, [
    'ErrorRenderer',
  ]) as MantineFieldComponent<SuppliedCheckboxProps, Props, ErrorOfField<F[K]>>
}

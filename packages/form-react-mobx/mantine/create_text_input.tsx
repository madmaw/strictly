import { type ErrorTypeOfField } from 'types/error_type_of_field'
import { type Fields } from 'types/field'
import { type StringFieldsOfFields } from 'types/string_fields_of_fields'
import { createUnsafePartialObserverComponent } from 'util/partial'
import { type ErrorRenderer } from './hooks'
import {
  type MantineFieldComponent,
  type MantineForm,
} from './types'

export type TextInputTarget = Element & {
  value: string,
}

export type SuppliedTextInputProps<
  T extends TextInputTarget = TextInputTarget,
> = Partial<{
  name: string,
  value: string | number | readonly string[] | undefined,
  disabled: boolean,
  required: boolean,
  onChange: (e: React.ChangeEvent<T>) => void,
  onFocus: (e: React.FocusEvent<T>) => void,
  onBlur: (e: React.FocusEvent<T>) => void,
  onKeyUp: (e: React.KeyboardEvent<T>) => void,
}>

export function createTextInput<
  F extends Fields,
  K extends keyof StringFieldsOfFields<F>,
  Props extends SuppliedTextInputProps,
>(
  this: MantineForm<F>,
  valuePath: K,
  TextInput: React.ComponentType<Props>,
  ErrorRenderer: ErrorRenderer<ErrorTypeOfField<F[K]>>,
): MantineFieldComponent<SuppliedTextInputProps, Props> {
  const onChange = (e: React.ChangeEvent<TextInputTarget>) => {
    this.onFieldValueChange?.(valuePath, e.target.value)
  }
  const onFocus = () => {
    this.onFieldFocus?.(valuePath)
  }
  const onBlur = () => {
    this.onFieldBlur?.(valuePath)
  }
  const onKeyUp = (e: React.KeyboardEvent) => {
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
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      name: valuePath as string,
      value,
      disabled,
      required,
      error: error && <ErrorRenderer error={error} />,
      onChange,
      onFocus,
      onBlur,
      onKeyUp,
    }
  }
  return createUnsafePartialObserverComponent<typeof TextInput, SuppliedTextInputProps>(
    TextInput,
    propSource,
  )
}

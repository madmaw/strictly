import { type ErrorOfField } from 'types/ErrorOfField'
import { type Fields } from 'types/Field'
import { type StringFieldsOfFields } from 'types/StringFieldsOfFields'
import { createUnsafePartialObserverComponent } from 'util/Partial'
import {
  DefaultErrorRenderer,
  type ErrorRenderer,
} from './ErrorRenderer'
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
): MantineFieldComponent<SuppliedTextInputProps, Props, ErrorOfField<F[K]>> {
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

  const propSource = ({
    ErrorRenderer = DefaultErrorRenderer,
  }: {
    ErrorRenderer?: ErrorRenderer<ErrorOfField<F[K]>>,
  }) => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const field = this.fields[valuePath as string]
    if (field == null) {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      throw new Error(`invalid field ${valuePath as string}`)
    }
    const {
      readonly,
      required,
      value,
      error,
    } = field
    return {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      name: valuePath as string,
      value,
      disabled: readonly,
      required,
      error: error && <ErrorRenderer error={error} />,
      onChange,
      onFocus,
      onBlur,
      onKeyUp,
    }
  }
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return createUnsafePartialObserverComponent<
    typeof TextInput,
    SuppliedTextInputProps,
    { ErrorRenderer?: ErrorRenderer<ErrorOfField<F[K]>> },
    ['ErrorRenderer']
  >(
    TextInput,
    propSource,
    ['ErrorRenderer'],
  ) as MantineFieldComponent<SuppliedTextInputProps, Props, ErrorOfField<F[K]>>
}

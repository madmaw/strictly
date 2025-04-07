import { type AllFieldsOfFields } from 'types/all_fields_of_fields'
import { type ErrorOfField } from 'types/error_of_field'
import { type Fields } from 'types/field'
import { type ValueTypeOfField } from 'types/value_type_of_field'
import { createUnsafePartialObserverComponent } from 'util/partial'
import {
  DefaultErrorRenderer,
  type ErrorRenderer,
} from './error_renderer'
import {
  type MantineFieldComponent,
  type MantineForm,
} from './types'

export type SuppliedValueInputProps<
  V,
  T extends Element = Element,
> = Partial<{
  name: string,
  value: V,
  disabled: boolean,
  required: boolean,
  onChange: (value: V) => void,
  onFocus: (e: React.FocusEvent<T>) => void,
  onBlur: (e: React.FocusEvent<T>) => void,
  onKeyUp: (e: React.KeyboardEvent<T>) => void,
}>

export function createValueInput<
  F extends Fields,
  K extends keyof AllFieldsOfFields<F>,
  Props extends SuppliedValueInputProps<ValueTypeOfField<F[K]>>,
>(
  this: MantineForm<F>,
  valuePath: K,
  ValueInput: React.ComponentType<Props>,
): MantineFieldComponent<SuppliedValueInputProps<ValueTypeOfField<F[K]>>, Props, ErrorOfField<F[K]>> {
  const onChange = (value: ValueTypeOfField<F[K]>) => {
    this.onFieldValueChange?.(valuePath, value)
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
    const {
      readonly,
      required,
      value,
      error,
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    } = this.fields[valuePath as string]
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
    typeof ValueInput,
    SuppliedValueInputProps<ValueTypeOfField<F[K]>>,
    { ErrorRenderer?: ErrorRenderer<ErrorOfField<F[K]>> },
    ['ErrorRenderer']
  >(
    ValueInput,
    propSource,
    ['ErrorRenderer'],
  ) as MantineFieldComponent<SuppliedValueInputProps<ValueTypeOfField<F[K]>>, Props, ErrorOfField<F[K]>>
}

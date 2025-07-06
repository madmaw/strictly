import {
  type RadioGroupProps,
} from '@mantine/core'
import { type ComponentType } from 'react'
import { type ErrorOfField } from 'types/ErrorOfField'
import {
  type Fields,
} from 'types/Field'
import { type StringFieldsOfFields } from 'types/StringFieldsOfFields'
import {
  createUnsafePartialObserverComponent,
} from 'util/Partial'
import {
  DefaultErrorRenderer,
  type ErrorRenderer,
} from './ErrorRenderer'
import {
  type MantineFieldComponent,
  type MantineForm,
} from './types'

export type SuppliedRadioGroupProps = Pick<
  RadioGroupProps,
  'name' | 'value' | 'required' | 'error' | 'onChange' | 'onFocus' | 'onBlur' | 'onKeyUp'
>

export function createRadioGroup<
  F extends Fields,
  K extends keyof StringFieldsOfFields<F>,
  Props extends SuppliedRadioGroupProps,
>(
  this: MantineForm<F>,
  valuePath: K,
  RadioGroup: ComponentType<Props>,
): MantineFieldComponent<SuppliedRadioGroupProps, Props, ErrorOfField<F[K]>> {
  const onChange = (value: string) => {
    this.onFieldValueChange?.(valuePath, value)
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

  const propSource = ({ ErrorRenderer = DefaultErrorRenderer }: { ErrorRenderer?: ErrorRenderer }) => {
    const {
      required,
      value,
      error,
    } = this.fields[valuePath]

    return {
      name: valuePath,
      value,
      required,
      error: error && <ErrorRenderer error={error} />,
      onChange,
      onFocus,
      onBlur,
      onKeyUp,
    }
  }
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return createUnsafePartialObserverComponent(RadioGroup, propSource, ['ErrorRenderer']) as MantineFieldComponent<
    SuppliedRadioGroupProps,
    Props,
    ErrorOfField<F[K]>
  >
}

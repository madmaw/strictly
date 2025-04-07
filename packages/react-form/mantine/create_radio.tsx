import { type RadioProps } from '@mantine/core'
import { type ComponentType } from 'react'
import {
  type Fields,
} from 'types/field'
import { type StringFieldsOfFields } from 'types/string_fields_of_fields'
import { type ValueTypeOfField } from 'types/value_type_of_field'
import { createUnsafePartialObserverComponent } from 'util/partial'
import {
  type MantineFieldComponent,
  type MantineForm,
} from './types'

export type SuppliedRadioProps = Pick<RadioProps, 'value' | 'disabled'>

export function createRadio<
  F extends Fields,
  K extends keyof StringFieldsOfFields<F>,
  Props extends SuppliedRadioProps,
>(
  this: MantineForm<F>,
  valuePath: K,
  value: ValueTypeOfField<F[K]>,
  Radio: ComponentType<Props>,
): MantineFieldComponent<SuppliedRadioProps, Props, never> {
  const propSource = () => {
    return {
      disabled: this.fields[valuePath].readonly,
      value,
    }
  }
  return createUnsafePartialObserverComponent(
    Radio,
    propSource,
  )
}

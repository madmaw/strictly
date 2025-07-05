import { type RadioProps } from '@mantine/core'
import { type ComponentType } from 'react'
import {
  type Fields,
} from 'types/Field'
import { type StringFieldsOfFields } from 'types/StringFieldsOfFields'
import { type ValueTypeOfField } from 'types/ValueTypeOfField'
import { createUnsafePartialObserverComponent } from 'util/Partial'
import {
  type MantineFieldComponent,
  type MantineForm,
} from './Types'

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

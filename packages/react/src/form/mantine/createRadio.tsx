import { type RadioProps } from '@mantine/core'
import { type Fields } from 'form/types/Field'
import { type StringFieldsOfFields } from 'form/types/StringFieldsOfFields'
import { type ValueTypeOfField } from 'form/types/ValueTypeOfField'
import { createUnsafePartialObserverComponent } from 'form/util/Partial'
import { type ComponentType } from 'react'
import { type MantineFieldComponent, type MantineForm } from './types'

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
  const propSource = () => ({
    disabled: this.fields[valuePath].readonly,
    value,
  })
  return createUnsafePartialObserverComponent(Radio, propSource)
}

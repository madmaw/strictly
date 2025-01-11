import {
  type PillProps,
} from '@mantine/core'
import { type ComponentType } from 'react'
import { type AllFieldsOfFields } from 'types/all_fields_of_fields'
import { type Fields } from 'types/field'
import { createUnsafePartialObserverComponent } from 'util/partial'
import {
  type MantineFieldComponent,
  type MantineForm,
} from './types'

// TODO should probably supply everything
export type SuppliedPillProps = Pick<
  PillProps,
  | 'children'
  | 'disabled'
>

export function createPill<
  F extends Fields,
  K extends keyof AllFieldsOfFields<F>,
  Props extends SuppliedPillProps,
>(
  this: MantineForm<F>,
  valuePath: K,
  Pill: ComponentType<Props>,
): MantineFieldComponent<SuppliedPillProps, Props> {
  const propSource = () => {
    const {
      readonly,
      value,
      // note: individual pills cannot display an error!
      // error,
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    } = this.fields[valuePath as string]
    return {
      children: value,
      disabled: readonly,
    }
  }
  return createUnsafePartialObserverComponent<typeof Pill, SuppliedPillProps>(Pill, propSource)
}

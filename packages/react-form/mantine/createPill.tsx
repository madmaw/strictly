import {
  type PillProps,
} from '@mantine/core'
import { type ComponentType } from 'react'
import { type AllFieldsOfFields } from 'types/AllFieldsOfFields'
import { type Fields } from 'types/Field'
import { createUnsafePartialObserverComponent } from 'util/Partial'
import {
  type MantineFieldComponent,
  type MantineForm,
} from './Types'

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
): MantineFieldComponent<SuppliedPillProps, Props, never> {
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

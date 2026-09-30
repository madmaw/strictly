import { type PillProps } from '@mantine/core'
import { type StringKeyOf } from '@strictly/base'
import { type Fields } from 'form/types/Field'
import { createUnsafePartialObserverComponent } from 'form/util/Partial'
import { type ComponentType } from 'react'
import { type MantineFieldComponent, type MantineForm } from './types'

// TODO should probably supply everything
export type SuppliedPillProps = Pick<PillProps, 'children' | 'disabled'>

export function createPill<
  F extends Fields,
  K extends StringKeyOf<F>,
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
    } = this.fields[valuePath as string]
    return {
      children: value,
      disabled: readonly,
    }
  }
  return createUnsafePartialObserverComponent<typeof Pill, SuppliedPillProps>(
    Pill,
    propSource,
  )
}

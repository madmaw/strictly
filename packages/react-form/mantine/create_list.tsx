import { type ElementOfArray } from '@strictly/base'
import { type ComponentType } from 'react'
import { type Fields } from 'types/field'
import { type ListFieldsOfFields } from 'types/list_fields_of_fields'
import { type ValueTypeOfField } from 'types/value_type_of_field'
import { createUnsafePartialObserverComponent } from 'util/partial'
import {
  type MantineFieldComponent,
  type MantineForm,
} from './types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SuppliedListProps<Value = any> = {
  values: readonly Value[],
}

export function createList<
  F extends Fields,
  K extends keyof ListFieldsOfFields<F>,
  Props extends SuppliedListProps<ElementOfArray<ValueTypeOfField<F[K]>>> & {
    children: (
      value: ElementOfArray<ValueTypeOfField<F[K]>>,
      index: number,
    ) => React.ReactNode,
  },
>(
  this: MantineForm<F>,
  valuePath: K,
  List: ComponentType<Props>,
): MantineFieldComponent<SuppliedListProps<ElementOfArray<ValueTypeOfField<F[K]>>>, Props> {
  const propSource = () => {
    const values = [...this.fields[valuePath].value]
    return {
      values,
    }
  }
  return createUnsafePartialObserverComponent(List, propSource)
}

export function DefaultList<
  Value,
>({
  values,
  children,
}: SuppliedListProps<Value> & {
  children: (value: Value, index: number) => React.ReactNode,
}) {
  return (
    <>
      {values.map(function (value, index) {
        return children(value, index)
      })}
    </>
  )
}

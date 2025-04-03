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
export type SuppliedListProps<Value = any, ListPath extends string = string> = {
  values: readonly Value[],
  listPath: ListPath,
}

export function createList<
  F extends Fields,
  K extends keyof ListFieldsOfFields<F>,
  Props extends SuppliedListProps<ElementOfArray<ValueTypeOfField<F[K]>>> & {
    children: (
      valuePath: `${K}.${number}`,
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
      listPath: valuePath,
    }
  }
  return createUnsafePartialObserverComponent(List, propSource)
}

export function DefaultList<
  Value,
  ListPath extends string,
>({
  values,
  listPath,
  children,
}: SuppliedListProps<Value, ListPath> & {
  children: (valuePath: `${ListPath}.${number}`, value: Value, index: number) => React.ReactNode,
}) {
  return (
    <>
      {values.map(function (value, index) {
        const valuePath: `${ListPath}.${number}` = `${listPath}.${index}`
        return children(valuePath, value, index)
      })}
    </>
  )
}

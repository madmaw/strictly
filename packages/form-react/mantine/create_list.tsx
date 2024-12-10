import { type ComponentType } from 'react'
import { type Fields } from 'types/field'
import { type ListFieldsOfFields } from 'types/list_fields_of_fields'
import { createUnsafePartialObserverComponent } from 'util/partial'
import {
  type MantineFieldComponent,
  type MantineForm,
} from './types'

export type SuppliedListProps<ValuePath extends string> = {
  valuePaths: readonly `${ValuePath}.${number}`[],
}

export function createList<
  F extends Fields,
  K extends keyof ListFieldsOfFields<F>,
  Props extends SuppliedListProps<K> & {
    children: (valuePath: `${K}.${number}`, index: number) => React.ReactNode,
  },
>(
  this: MantineForm<F>,
  valuePath: K,
  List: ComponentType<Props>,
): MantineFieldComponent<SuppliedListProps<K>, Props> {
  const propSource = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const list: any[] = this.fields[valuePath].value
    const valuePaths = list.map(function (_v, i) {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return `${valuePath as string}.${i}` as `${K}.${number}`
    })
    return {
      valuePaths,
    }
  }
  return createUnsafePartialObserverComponent<typeof List, SuppliedListProps<K>>(List, propSource)
}

export function DefaultList<
  K extends string,
>({
  valuePaths,
  children,
}: SuppliedListProps<K> & {
  children: (valuePath: `${K}.${number}`, index: number) => React.ReactNode,
}) {
  return (
    <>
      {valuePaths.map(function (valuePath, index) {
        return children(valuePath, index)
      })}
    </>
  )
}

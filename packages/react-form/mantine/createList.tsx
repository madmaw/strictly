import {
  assertExistsAndReturn,
  type ElementOfArray,
} from '@strictly/base'
import {
  type ComponentType,
  Fragment,
} from 'react'
import { type Fields } from 'types/Field'
import { type ListFieldsOfFields } from 'types/ListFieldsOfFields'
import { type ValueTypeOfField } from 'types/ValueTypeOfField'
import { createUnsafePartialObserverComponent } from 'util/Partial'
import {
  type MantineFieldComponent,
  type MantineForm,
} from './types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SuppliedListProps<Value = any, ListPath extends string = string> = {
  values: readonly Value[],
  indexKeys: number[],
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
): MantineFieldComponent<SuppliedListProps<ElementOfArray<ValueTypeOfField<F[K]>>>, Props, never> {
  const propSource = () => {
    const field = this.fields[valuePath]
    const values = [...field.value]
    return {
      values,
      listPath: valuePath,
      indexKeys: assertExistsAndReturn(field.listIndexToKey, 'list index to key mapping missing in {}', valuePath),
    }
  }
  return createUnsafePartialObserverComponent(List, propSource)
}

export function DefaultList<
  Value,
  ListPath extends string,
>({
  values,
  indexKeys,
  listPath,
  children,
}: SuppliedListProps<Value, ListPath> & {
  children: (valuePath: `${ListPath}.${number}`, value: Value, index: number) => React.ReactNode,
}) {
  return (
    <>
      {values.map(function (value, index) {
        return [
          value,
          index,
          indexKeys[index],
        ] as const
      }).filter(function ([
        _value,
        _index,
        key,
      ]) {
        // omit entries without keys
        return key != null
      }).map(function ([
        value,
        index,
        key,
      ]) {
        const valuePath: `${ListPath}.${number}` = `${listPath}.${key}`
        return (
          <Fragment key={valuePath}>
            {children(valuePath, value, index)}
          </Fragment>
        )
      })}
    </>
  )
}

import {
  type Type,
  type TypeDef,
} from 'types/Definitions'
import {
  type Accessor,
  type FlattenedAccessorsOfType,
} from 'types/FlattenedAccessorsOfType'
import { type ValueOfType } from 'types/ValueOfType'
import {
  type AnyValueType,
  flattenValueTo,
  type Setter,
} from './flattenValueTo'

function mapAccessor(
  _t: TypeDef,
  value: AnyValueType,
  set: Setter<AnyValueType>,
): Accessor<AnyValueType> {
  return {
    value,
    set,
  }
}

export function flattenAccessorsOfType<
  T extends Type,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  R extends Readonly<Record<string, Accessor<any>>> = FlattenedAccessorsOfType<T>,
>(
  t: T,
  value: ValueOfType<T>,
  setValue: Setter<ValueOfType<T>>,
  listIndicesToKeys?: Record<string, number[]>,
): R {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return flattenValueTo<T, Accessor<any>, R>(
    t,
    value,
    setValue,
    mapAccessor,
    listIndicesToKeys,
  )
}

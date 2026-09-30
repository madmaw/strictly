import {
  type Accessor,
  type FlattenedAccessorsOfType,
} from 'define/types/FlattenedAccessorsOfType'
import { type Type } from 'define/types/Type'
import { type ValueOfType } from 'define/types/ValueOfType'
import {
  type AnyValueType,
  flattenValueTo,
  type Setter,
} from './flattenValueTo'

function mapAccessor(
  _t: Type,
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
  R extends Readonly<Record<string, Accessor<any>>> =
    FlattenedAccessorsOfType<T>,
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

import {
  type Type,
  type TypeDef,
} from 'types/definitions'
import {
  type Accessor,
  type FlattenedAccessorsOfType,
} from 'types/flattened_accessors_of_type'
import { type ValueOfType } from 'types/value_of_type'
import {
  type AnyValueType,
  flattenValueTypeTo,
  type Setter,
} from './flatten_value_type_to'

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
): R {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return flattenValueTypeTo<T, Accessor<any>, R>(
    t,
    value,
    setValue,
    mapAccessor,
  )
}

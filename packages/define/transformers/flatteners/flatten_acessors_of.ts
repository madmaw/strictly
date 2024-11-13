import {
  type TypeDef,
  type TypeDefHolder,
} from 'types/definitions'
import { type Accessor } from 'types/flattened_accessors_of'
import { type ValueTypeOf } from 'types/value_type_of'
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

export function flattenAccessorsOf<T extends TypeDefHolder>(
  t: T,
  value: ValueTypeOf<T>,
  setValue: Setter<ValueTypeOf<T>>,
) {
  flattenValueTypeTo(
    t,
    value,
    setValue,
    mapAccessor,
  )
}

import { type TypeDefHolder } from 'types/definitions'
import { type ValueTypeOf } from 'types/value_type_of'
import {
  type AnyValueType,
  flattenValueTypeTo,
} from './flatten_value_type_to'

function mapper(v: AnyValueType) {
  return v
}

export function flattenValueTypeOf<T extends TypeDefHolder>(
  typeDef: TypeDefHolder,
  value: ValueTypeOf<T>,
) {
  return flattenValueTypeTo(typeDef, value, mapper)
}

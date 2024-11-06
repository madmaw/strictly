import { type TypeDefHolder } from 'types/definitions'
import { type ValueTypeOf } from 'types/value_type_of'
import {
  type AnyValueType,
  flattenValue,
} from './flatten_value_to'

function mapper(v: AnyValueType) {
  return v
}

export function flattenValueOf<T extends TypeDefHolder>(
  typeDef: TypeDefHolder,
  value: ValueTypeOf<T>,
) {
  return flattenValue(typeDef, value, mapper)
}

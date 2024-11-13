import { type TypeDefHolder } from 'types/definitions'
import { type StrictTypeDef } from 'types/strict_definitions'
import { type ValueTypeOf } from 'types/value_type_of'
import {
  type AnyValueType,
  flattenValueTypeTo,
} from './flatten_value_type_to'

function mapper(_t: StrictTypeDef, v: AnyValueType) {
  return v
}

export function flattenValueTypesOf<T extends TypeDefHolder>(
  typeDef: TypeDefHolder,
  value: ValueTypeOf<T>,
) {
  return flattenValueTypeTo(
    typeDef,
    value,
    () => {},
    mapper,
  )
}

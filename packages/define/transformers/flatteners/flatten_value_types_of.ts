import { type Type } from 'types/definitions'
import { type StrictTypeDef } from 'types/strict_definitions'
import { type ValueOfType } from 'types/value_of_type'
import {
  type AnyValueType,
  flattenValueTypeTo,
} from './flatten_value_type_to'

function mapper(_t: StrictTypeDef, v: AnyValueType) {
  return v
}

export function flattenValueTypesOf<T extends Type>(
  typeDef: Type,
  value: ValueOfType<T>,
) {
  return flattenValueTypeTo(
    typeDef,
    value,
    () => {},
    mapper,
  )
}

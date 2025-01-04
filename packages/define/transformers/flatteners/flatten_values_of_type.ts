import { type Type } from 'types/definitions'
import { type StrictTypeDef } from 'types/strict_definitions'
import { type ValueOfType } from 'types/value_of_type'
import {
  type AnyValueType,
  flattenValueTo,
} from './flatten_value_to'

function mapper(_t: StrictTypeDef, v: AnyValueType) {
  return v
}

export function flattenValuesOfType<T extends Type>(
  typeDef: Type,
  value: ValueOfType<T>,
) {
  return flattenValueTo(
    typeDef,
    value,
    () => {},
    mapper,
  )
}

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
  listIndicesToKeys?: Record<string, number[]>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Record<string, any> {
  return flattenValueTo(
    typeDef,
    value,
    () => {},
    mapper,
    listIndicesToKeys,
  )
}

import { type Type } from 'types/Definitions'
import { type StrictTypeDef } from 'types/StrictDefinitions'
import { type ValueOfType } from 'types/ValueOfType'
import {
  type AnyValueType,
  flattenValueTo,
} from './flattenValueTo'

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

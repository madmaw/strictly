import { type Type } from 'define/types/Type'
import { type ValueOfType } from 'define/types/ValueOfType'
import { type AnyValueType, flattenValueTo } from './flattenValueTo'

function mapper(_t: Type, v: AnyValueType) {
  return v
}

export function flattenValuesOfType<T extends Type>(
  t: Type,
  value: ValueOfType<T>,
  listIndicesToKeys?: Record<string, number[]>,
  // oxlint-disable-next-line typescript/no-explicit-any
): Record<string, any> {
  return flattenValueTo(t, value, () => {}, mapper, listIndicesToKeys)
}

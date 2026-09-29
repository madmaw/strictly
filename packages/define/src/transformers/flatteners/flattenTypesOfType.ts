import { type Type } from 'types/Type'
import { flattenTypeTo } from './flattenTypeTo'

export function flattenTypesOfType<T extends Type>(t: T) {
  // Type should be FlattenedTypesOfType<T>, but infinite depth error
  return flattenTypeTo<Type, Record<string, Type>>(t, (type) => type)
}

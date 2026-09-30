import { type FlattenedTypesOfType } from 'types/FlattenedTypesOfType'
import { type Type } from 'types/Type'
import { flattenTypeTo } from './flattenTypeTo'

export function flattenTypesOfType<T extends Type>(
  t: T,
): FlattenedTypesOfType<T, '*'> {
  return flattenTypeTo<Type, Record<string, Type>>(
    t,
    (type) => type,
  ) as FlattenedTypesOfType<T, '*'>
}

import {
  type Type,
  type TypeDef,
} from 'types/definitions'
import { type StrictType } from 'types/strict_definitions'
import { flattenTypeTo } from './flatten_type_to'

export function flattenTypesOfType<T extends StrictType>(t: T) {
  // Type should be FlattenedTypeDefsOf<T>, but infinite depth error
  return flattenTypeTo<StrictType, Record<string, Type>>(
    t,
    function (definition: TypeDef) {
      return { definition }
    },
  )
}

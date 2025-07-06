import { type StrictType } from 'types/StrictType'
import {
  type Type,
  type TypeDef,
} from 'types/Type'
import { flattenTypeTo } from './flattenTypeTo'

export function flattenTypesOfType<T extends StrictType>(t: T) {
  // Type should be FlattenedTypeDefsOf<T>, but infinite depth error
  return flattenTypeTo<StrictType, Record<string, Type>>(
    t,
    function (definition: TypeDef) {
      return { definition }
    },
  )
}

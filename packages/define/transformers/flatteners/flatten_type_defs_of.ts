import {
  type Type,
  type TypeDef,
} from 'types/definitions'
import { type StrictType } from 'types/strict_definitions'
import { flattenTypeDefTo } from './flatten_type_def_to'

export function flattenTypeDefsOf<T extends StrictType>(t: T) {
  // Type should be FlattenedTypeDefsOf<T>, but infinite depth error
  return flattenTypeDefTo<StrictType, Record<string, Type>>(
    t,
    function (definition: TypeDef) {
      return { definition }
    },
  )
}

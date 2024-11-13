import {
  type TypeDef,
  type TypeDefHolder,
} from 'types/definitions'
import { type StrictTypeDefHolder } from 'types/strict_definitions'
import { flattenTypeDefTo } from './flatten_type_def_to'

export function flattenTypeDefsOf<T extends StrictTypeDefHolder>(t: T) {
  // Type should be FlattenedTypeDefsOf<T>, but infinite depth error
  return flattenTypeDefTo<StrictTypeDefHolder, Record<string, TypeDefHolder>>(
    t,
    function (typeDef: TypeDef) {
      return { typeDef }
    },
  )
}

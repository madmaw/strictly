import {
  type TypeDef,
  type TypeDefHolder,
} from 'types/definitions'
import { type StrictTypeDefHolder } from 'types/strict_definitions'
import { flattenTypeDefsTo } from './flatten_type_defs_to'

export function flattenTypeDefsOf<T extends StrictTypeDefHolder>(t: T) {
  // Type should be FlattenedTypeDefsOf<T>, but infinite depth error
  return flattenTypeDefsTo<StrictTypeDefHolder, Record<string, TypeDefHolder>>(
    t,
    function (typeDef: TypeDef) {
      return { typeDef }
    },
  )
}

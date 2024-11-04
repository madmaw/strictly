import {
  type TypeDef,
  type TypeDefHolder,
} from 'types/definitions'
import { type ReadonlyTypeDefOf } from 'types/readonly_type_def_of'
import { type ValueTypeOf } from 'types/value_type_of'

export type Mapper<R> = (t: TypeDef) => R

export function flatten<T extends TypeDefHolder, R>(
  { typeDef }: T,
  v: ValueTypeOf<ReadonlyTypeDefOf<T>>,
): R {
  return null as R
}

import { type TypeDefHolder } from 'types/defs'
import { type ReadonlyTypeDefOf } from 'types/defs/readonly_type_def_of'
import { type ValueTypeOf } from 'types/defs/value_type_of'

export function mobxCopy<T extends TypeDefHolder>(
  { typeDef }: T,
  proto: ValueTypeOf<ReadonlyTypeDefOf<T>>,
): ValueTypeOf<T> {
  return null as any
}

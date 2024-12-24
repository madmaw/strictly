import { type ReadonlyTypeDefOf } from 'types/readonly_type_def_of'
import { type StrictType } from 'types/strict_definitions'
import { type ValueTypeOf } from 'types/value_type_of'
import {
  type AnyValueType,
  copyTo,
} from './copy_to'

function identity(v: AnyValueType): AnyValueType {
  return v
}

export function copy<T extends StrictType>(
  t: T,
  proto: ValueTypeOf<ReadonlyTypeDefOf<T>>,
): ValueTypeOf<T> {
  return copyTo(t, proto, identity)
}

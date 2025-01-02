import { type ReadonlyTypeOfType } from 'types/readonly_type_of_type'
import { type StrictType } from 'types/strict_definitions'
import { type ValueOfType } from 'types/value_of_type'
import {
  type AnyValueType,
  copyTo,
} from './copy_to'

function identity(v: AnyValueType): AnyValueType {
  return v
}

export function copy<T extends StrictType>(
  t: T,
  proto: ValueOfType<ReadonlyTypeOfType<T>>,
): ValueOfType<T> {
  return copyTo(t, proto, identity)
}

import { type ReadonlyTypeOfType } from 'types/ReadonlyTypeOfType'
import { type Type } from 'types/Type'
import { type ValueOfType } from 'types/ValueOfType'
import { type AnyValueType, copyTo } from './copyTo'

function identity(v: AnyValueType): AnyValueType {
  return v
}

export function copy<T extends Type>(
  t: T,
  proto: ValueOfType<ReadonlyTypeOfType<T>>,
): ValueOfType<T> {
  return copyTo(t, proto, identity)
}

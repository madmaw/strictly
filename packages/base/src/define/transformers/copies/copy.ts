import { type ReadonlyTypeOfType } from 'define/types/ReadonlyTypeOfType'
import { type Type } from 'define/types/Type'
import { type ValueOfType } from 'define/types/ValueOfType'
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

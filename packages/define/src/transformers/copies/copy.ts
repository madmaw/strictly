import { type ReadonlyTypeOfType } from 'types/ReadonlyTypeOfType'
import { type StrictType } from 'types/StrictType'
import { type ValueOfType } from 'types/ValueOfType'
import {
  type AnyValueType,
  copyTo,
} from './copyTo'

function identity(v: AnyValueType): AnyValueType {
  return v
}

export function copy<T extends StrictType>(
  t: T,
  proto: ValueOfType<ReadonlyTypeOfType<T>>,
): ValueOfType<T> {
  return copyTo(t, proto, identity)
}

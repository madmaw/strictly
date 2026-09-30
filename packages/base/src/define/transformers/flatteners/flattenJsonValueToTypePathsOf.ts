import { type Type } from 'define/types/Type'
import { type ValueOfType } from 'define/types/ValueOfType'
import {
  type AnyValueType,
  flattenValueTo,
  type Setter,
} from './flattenValueTo'

function mapTypePaths(
  _t: Type,
  _value: AnyValueType,
  _set: Setter<AnyValueType>,
  typePath: string,
) {
  return typePath
}

export function flattenJsonValueToTypePathsOf<
  T extends Type,
  R extends Record<string, string | number | symbol>,
>(
  t: T,
  value: ValueOfType<T>,
  // TODO
  // : FlattenedJsonValueToTypePathsOf<T>
  listIndicesToKeys?: Record<string, number[]>,
): R {
  return flattenValueTo(
    t,
    value,
    () => {
      // do nothing
    },
    mapTypePaths,
    listIndicesToKeys,
  ) as R
}

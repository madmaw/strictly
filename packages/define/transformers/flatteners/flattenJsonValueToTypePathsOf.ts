import {
  type Type,
  type TypeDef,
} from 'types/Definitions'
import { type ValueOfType } from 'types/ValueOfType'
import {
  type AnyValueType,
  flattenValueTo,
  type Setter,
} from './flattenValueTo'

function mapTypePaths(
  _t: TypeDef,
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
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return flattenValueTo(
    t,
    value,
    function () {
      // do nothing
    },
    mapTypePaths,
    listIndicesToKeys,
  ) as R
}

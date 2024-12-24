import {
  type Type,
  type TypeDef,
} from 'types/definitions'
import { type ValueTypeOf } from 'types/value_type_of'
import {
  type AnyValueType,
  flattenValueTypeTo,
  type Setter,
} from './flatten_value_type_to'

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
  value: ValueTypeOf<T>,
  // TODO
  // : FlattenedJsonValueToTypePathsOf<T>
): R {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return flattenValueTypeTo(
    t,
    value,
    function () {
      // do nothing
    },
    mapTypePaths,
  ) as R
}

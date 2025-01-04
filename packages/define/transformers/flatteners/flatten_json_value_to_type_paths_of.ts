import {
  type Type,
  type TypeDef,
} from 'types/definitions'
import { type ValueOfType } from 'types/value_of_type'
import {
  type AnyValueType,
  flattenValueTo,
  type Setter,
} from './flatten_value_to'

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
): R {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return flattenValueTo(
    t,
    value,
    function () {
      // do nothing
    },
    mapTypePaths,
  ) as R
}

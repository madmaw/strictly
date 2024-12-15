import { type FieldValueFactory } from 'types/field_converters'

export function prototypingFieldValueFactory<
  V,
  ValuePath extends string,
>(prototype: V): FieldValueFactory<V, ValuePath> {
  return function (): V {
    return prototype
  }
}

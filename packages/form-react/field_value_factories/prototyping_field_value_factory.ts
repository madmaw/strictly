import { type FieldValueFactory } from 'types/field_converters'

export function prototypingFieldValueFactory<
  V,
  ValuePath extends string,
  Context,
>(prototype: V): FieldValueFactory<V, ValuePath, Context> {
  return function (): V {
    return prototype
  }
}

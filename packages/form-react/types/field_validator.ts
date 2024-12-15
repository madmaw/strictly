export type FieldValidator<V, E, ValuePath extends string> = {
  (
    value: V,
    valuePath: ValuePath,
  ): E | null,
}

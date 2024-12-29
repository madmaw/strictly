export type FieldValidator<V, E, ValuePath extends string, Context> = {
  (
    value: V,
    valuePath: ValuePath,
    context: Context,
  ): E | null,
}

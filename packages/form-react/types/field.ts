// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Field<E = any, V = any> = {
  readonly value: V,
  readonly error?: E | undefined,
  readonly disabled: boolean,
}

export type ErrorTypeOfFormField<F extends Field> = F extends Field<infer E, infer _V> ? E : never

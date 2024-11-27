// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FormField<E = any, V = any> = {
  readonly value: V,
  readonly error?: E | undefined,
  readonly disabled: boolean,
}

export type ErrorTypeOfFormField<F extends FormField> = F extends FormField<infer E, infer _V> ? E : never

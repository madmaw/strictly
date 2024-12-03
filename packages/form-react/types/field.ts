// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Field<E = any, V = any> = {
  readonly value: V,
  readonly error?: E | undefined,
  readonly disabled: boolean,
  readonly required: boolean,
}

export type Fields = Readonly<Record<string, Field>>

export type ErrorTypeOfField<F extends Field> = F extends Field<infer E, infer _V> ? E : never

export type ValueTypeOfField<F extends Field> = F extends Field<infer _E, infer V> ? V : never

export type StringFieldsOfFields<F extends Fields> = {
  [K in keyof F as ValueTypeOfField<F[K]> extends string | undefined | null ? K : never]: F[K]
}

export type BooleanFieldsOfFields<F extends Fields> = {
  [K in keyof F as ValueTypeOfField<F[K]> extends boolean ? K : never]: F[K]
}

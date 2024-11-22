// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FormField<E = any, V = any> = {
  readonly value: V,
  readonly error?: E,
  readonly disabled: boolean,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Field<E = any, V = any> = {
  readonly value: V,
  readonly error?: E | undefined,
  readonly disabled: boolean,
  readonly required: boolean,
}

export type Fields = Readonly<Record<string, Field>>

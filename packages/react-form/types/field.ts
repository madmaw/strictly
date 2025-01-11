// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Field<V = any, E = any> = {
  readonly value: V,
  readonly error?: E | undefined,
  readonly readonly: boolean,
  readonly required: boolean,
}

export type Fields = Readonly<Record<string, Field>>

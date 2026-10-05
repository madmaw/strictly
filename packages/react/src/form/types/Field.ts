// oxlint-disable-next-line typescript/no-explicit-any
export type Field<V = any, E = any> = {
  readonly value: V
  readonly error?: E | undefined
  readonly readonly: boolean
  readonly required: boolean
  readonly listIndexToKey?: number[]
}

export type Fields = Readonly<Record<string, Field>>

import { type ReadonlyRecord } from '@tscriptors/core/util/record'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Field<V = any, E = any> = {
  readonly value: V,
  readonly errors?: readonly E[],
}

export type Fields = ReadonlyRecord<string, Field>

export type FormProps<F extends Fields> = {
  fields: F,

  onFieldValueChange<K extends keyof F>(this: void, key: K, value: F[K]['value']): void,

  onFieldFocus(this: void, key: keyof F): void,

  onFieldBlur(this: void, key: keyof F): void,
}

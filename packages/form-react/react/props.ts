import { type ReadonlyRecord } from '@de/fine/util/record'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FormField<V = any, E = any> = {
  readonly value: V,
  readonly error?: E,
  readonly disabled: boolean,
}

export type FormFields = ReadonlyRecord<string, FormField>

export type FormProps<F extends FormFields> = {
  fields: F,

  onFieldValueChange<K extends keyof F>(this: void, key: K, value: F[K]['value']): void,

  onFieldFocus(this: void, key: keyof F): void,

  onFieldBlur(this: void, key: keyof F): void,
}

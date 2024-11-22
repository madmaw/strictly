import { type ReadonlyRecord } from '@de/base'
import { type FormField } from 'types/form_field'

export type FormFields = ReadonlyRecord<string, FormField>

export type FormProps<F extends FormFields> = {
  fields: F,

  onFieldValueChange<K extends keyof F>(this: void, key: K, value: F[K]['value']): void,

  onFieldFocus?(this: void, key: keyof F): void,

  onFieldBlur?(this: void, key: keyof F): void,
}

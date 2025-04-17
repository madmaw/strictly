import { type Fields } from 'types/field'

export type FieldsViewProps<F extends Fields> = {
  fields: F,

  onFieldValueChange<K extends keyof F>(this: void, key: K, value: F[K]['value']): void,

  onFieldFocus?(this: void, key: keyof F): void,

  onFieldBlur?(this: void, key: keyof F): void,

  // when the user hits enter on a field, return true if
  // the default behavior should be suppressed
  onFieldSubmit?(this: void, key: keyof F): boolean | void,
}

export type FormMode = 'edit' | 'create'

export type FormProps<O> = {
  value: O,

  onValueChange: (value: O) => void,

  mode: FormMode,
}

import { type FormField } from 'types/form_field'

export type FormFields = Readonly<Record<string, FormField>>

export type FormProps<F extends FormFields> = {
  fields: F,

  onFieldValueChange<K extends keyof F>(this: void, key: K, value: F[K]['value']): void,

  onFieldFocus?(this: void, key: keyof F): void,

  onFieldBlur?(this: void, key: keyof F): void,

  // when the user hits enter on a field, return true if
  // the default behavior should be suppressed
  onFieldSubmit?(this: void, key: keyof F): boolean | void,
}

export type EditorProps<O> = {
  value: O,

  onValueChange: (value: O) => void,
}

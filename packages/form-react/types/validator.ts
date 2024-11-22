import { type FormField } from './form_field'

export type Validator<E, Fields extends Record<string, FormField>, V> = {
  (value: V, valuePath: keyof Fields, fields: Fields): E | null,
}

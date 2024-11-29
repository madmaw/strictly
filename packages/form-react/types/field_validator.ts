import { type Field } from './field'

export type FieldValidator<E, Fields extends Readonly<Record<string, Field>>, V> = {
  (value: V, valuePath: keyof Fields, fields: Fields): E | null,
}

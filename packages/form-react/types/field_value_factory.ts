import { type Field } from './field'

export type FieldValueFactory<Fields extends Readonly<Record<string, Field>>, V> = {
  create(valuePath: keyof Fields, fields: Fields): V,
}

import { type Field } from 'types/field'
import { type FieldValueFactory } from 'types/field_value_factory'

export class PrototypingFieldValueFactory<V> implements FieldValueFactory<Readonly<Record<string, Field>>, V> {
  constructor(private readonly prototype: V) {
  }

  create(): V {
    return this.prototype
  }
}

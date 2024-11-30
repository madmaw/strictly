import { type Field } from 'types/field'
import { type FieldConverter } from 'types/field_converter'
import { type FieldValueFactory } from 'types/field_value_factory'

export type FieldAdapter<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  E = any,
  Fields extends Readonly<Record<string, Field>> = Readonly<Record<string, Field>>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  To = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  From = any,
> = {
  readonly converter: FieldConverter<E, Fields, To, From>,
  readonly valueFactory: FieldValueFactory<Fields, To>,
}

export type ErrorTypeOfFieldAdapter<C extends FieldAdapter> = C extends FieldAdapter<infer E> ? E : never

export type FromTypeOfFieldAdapter<C extends FieldAdapter> = C extends
  FieldAdapter<infer _E, infer _F, infer _To, infer From> ? From
  : never

export type ToTypeOfFieldAdapter<C extends FieldAdapter> = C extends FieldAdapter<infer _E, infer _F, infer To> ? To
  : never

import { type ValueOf } from 'type-fest'
import { type Field } from 'types/field'
import { type FieldAdapter } from './field_adapter'

export type FormFieldsOfFieldAdapters<
  ValuePathsToTypePaths extends Readonly<Record<string, string>>,
  FieldAdapters extends Partial<Readonly<Record<ValueOf<ValuePathsToTypePaths>, FieldAdapter>>>,
> = {
  [
    K in keyof ValuePathsToTypePaths as FieldAdapters[ValuePathsToTypePaths[K]] extends undefined ? never : K
  ]: FormFieldOfFieldAdapter<FieldAdapters[ValuePathsToTypePaths[K]]>
}

type FormFieldOfFieldAdapter<
  F extends FieldAdapter | undefined,
> = F extends FieldAdapter<infer _From, infer To, infer E> ? Field<To, E> : never

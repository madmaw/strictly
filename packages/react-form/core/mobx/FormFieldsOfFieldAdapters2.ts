import { type ValueOf } from 'type-fest'
import { type Field } from 'types/Field'
import { type FieldAdapter } from './FieldAdapter'

export type FormFieldsOfFieldAdapters<
  ValuePathsToTypePaths extends Readonly<Record<string, string>>,
  FieldAdapters extends Partial<Readonly<Record<ValueOf<ValuePathsToTypePaths>, FieldAdapter>>>,
> = {
  [
    K in keyof ValuePathsToTypePaths as undefined extends FieldAdapters[ValuePathsToTypePaths[K]] ? never : K
  ]: FormFieldOfFieldAdapter<FieldAdapters[ValuePathsToTypePaths[K]]>
}

type FormFieldOfFieldAdapter<
  F extends FieldAdapter | undefined,
> = F extends FieldAdapter<infer _From, infer To, infer E> ? Field<To, E> : never

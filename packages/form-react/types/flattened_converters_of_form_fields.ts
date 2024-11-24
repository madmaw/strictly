import { type RequiredOfRecord } from '@de/base'
import {
  type TypeDefHolder,
  type ValueTypeOf,
} from '@de/fine'
import {
  type SimplifyDeep,
  type ValueOf,
} from 'type-fest'
import { type Converter } from './converter'
import { type FormField } from './form_field'

export type FlattenedConvertersOfFormFields<
  JsonPaths extends Readonly<Record<string, string>>,
  FlattenedTypeDefs extends Readonly<Record<ValueOf<JsonPaths>, TypeDefHolder>>,
  FormFields extends Partial<Readonly<Record<keyof JsonPaths, FormField>>>,
> = SimplifyDeep<{
  readonly [
    K in keyof JsonPaths as FormFields[K] extends FormField ? JsonPaths[K] : never
  ]: ConverterOfFormField<
    NonNullable<FormFields[K]>,
    FlattenedTypeDefs[JsonPaths[K]],
    RequiredOfRecord<FormFields>
  >
}>

type ConverterOfFormField<
  F extends FormField,
  T extends TypeDefHolder,
  FormFields extends Readonly<Record<string, FormField>>,
> = F extends FormField<infer E, infer V> ? Converter<E, FormFields, ValueTypeOf<T>, V>
  : never

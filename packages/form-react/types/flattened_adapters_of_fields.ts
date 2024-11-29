import { type RequiredOfRecord } from '@de/base'
import {
  type TypeDefHolder,
  type ValueTypeOf,
} from '@de/fine'
import { type FieldAdapter } from 'react/mobx/field_adapter'
import {
  type SimplifyDeep,
  type ValueOf,
} from 'type-fest'
import { type Field } from './field'

export type FlattenedAdaptersOfFields<
  JsonPaths extends Readonly<Record<string, string>>,
  FlattenedTypeDefs extends Readonly<Record<ValueOf<JsonPaths>, TypeDefHolder>>,
  FormFields extends Partial<Readonly<Record<keyof JsonPaths, Field>>>,
> = SimplifyDeep<{
  readonly [
    K in keyof JsonPaths as FormFields[K] extends Field ? JsonPaths[K] : never
  ]: AdapterOfField<
    NonNullable<FormFields[K]>,
    FlattenedTypeDefs[JsonPaths[K]],
    RequiredOfRecord<FormFields>
  >
}>

type AdapterOfField<
  F extends Field,
  T extends TypeDefHolder,
  FormFields extends Readonly<Record<string, Field>>,
> = F extends Field<infer E, infer V> ? FieldAdapter<E, FormFields, ValueTypeOf<T>, V>
  : never

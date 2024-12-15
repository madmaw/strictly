import {
  type ReadonlyTypeDefOf,
  type TypeDefHolder,
  type ValueTypeOf,
} from '@de/fine'
import { type FieldAdapter } from 'core/mobx/field_adapter'
import {
  type SimplifyDeep,
  type ValueOf,
} from 'type-fest'
import { type Field } from 'types/field'

export type FlattenedAdaptersOfFields<
  ValuePathsToTypePaths extends Readonly<Record<string, string>>,
  FlattenedTypeDefs extends Partial<Readonly<Record<ValueOf<ValuePathsToTypePaths>, TypeDefHolder>>>,
  FormFields extends Partial<Readonly<Record<keyof ValuePathsToTypePaths, Field>>>,
> = SimplifyDeep<{
  readonly [
    K in keyof ValuePathsToTypePaths as FormFields[K] extends Field ? ValuePathsToTypePaths[K] : never
  ]: AdapterOfField<
    NonNullable<FormFields[K]>,
    FlattenedTypeDefs[ValuePathsToTypePaths[K]],
    K
  >
}>

type AdapterOfField<
  F extends Field,
  T extends TypeDefHolder | undefined,
  ValuePath extends string | number | symbol,
> = ValuePath extends string
  ? F extends Field<infer V, infer E> ? undefined extends T ? FieldAdapter<V, V, E, ValuePath>
    : FieldAdapter<ValueTypeOf<ReadonlyTypeDefOf<NonNullable<T>>>, V, E, ValuePath>
  : never
  : never

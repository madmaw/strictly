import {
  type ReadonlyTypeOfType,
  type Type,
  type Validator,
  type ValueOfType,
} from '@strictly/define'
import {
  type SimplifyDeep,
  type ValueOf,
} from 'type-fest'
import { type Field } from 'types/Field'

export type FlattenedValidatorsOfFields<
  ValuePathsToTypePaths extends Readonly<Record<string, string>>,
  FlattenedTypeDefs extends Partial<Readonly<Record<ValueOf<ValuePathsToTypePaths>, Type>>>,
  FormFields extends Partial<Readonly<Record<keyof ValuePathsToTypePaths, Field>>>,
> = SimplifyDeep<{
  readonly [
    K in keyof ValuePathsToTypePaths as FormFields[K] extends Field ? ValuePathsToTypePaths[K] : never
  ]: ValidatorOfField<
    NonNullable<FormFields[K]>,
    FlattenedTypeDefs[ValuePathsToTypePaths[K]],
    K
  >
}>

type ValidatorOfField<
  F extends Field,
  T extends Type | undefined,
  ValuePath extends string | number | symbol,
> = ValuePath extends string ? F extends Field<infer V, infer E> ? undefined extends T ? Validator<V, E, ValuePath>
    : Validator<ValueOfType<ReadonlyTypeOfType<NonNullable<T>>>, E, ValuePath>
  : never
  : never

import { type AnyValueType } from 'transformers/copies/copy_to'
import {
  flattenValueTypeTo,
  type Setter,
} from 'transformers/flatteners/flatten_value_type_to'
import {
  type ReadonlyDeep,
  type ValueOf,
} from 'type-fest'
import { type Type } from 'types/definitions'
import { type FlattenedTypesOfType } from 'types/flattened_types_of_type'
import { type FlattenedValuesOfType } from 'types/flattened_values_of_type'
import { type ReadonlyTypeOfType } from 'types/readonly_type_of_type'
import { type StrictTypeDef } from 'types/strict_definitions'
import { type ValueOfType } from 'types/value_of_type'
import { type Validator } from 'validation/validator'

type ValidationOfValidator<V extends Validator> = V extends Validator<infer _V, infer E> ? E | null : never

export type ValidationsOfFlattenedValidators<
  TypePathsToValidators extends Readonly<Record<string, Validator>>,
> = {
  [K in keyof TypePathsToValidators]: ValidationOfValidator<TypePathsToValidators[K]>
}

export type FlattenedTypePathsToValidatorsOf<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  FlattenedValues extends Readonly<Record<string, any>>,
  Context,
> = {
  readonly [
    K in keyof FlattenedValues
    // TODO would be better to use the equivalent readonly typedef, but it causes typescript to
    // infinitely recurse
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ]?: Validator<ReadonlyDeep<FlattenedValues[K]>, any, any, Context>
}

export type ValuePathsToValidatorsOf<
  TypePathsToAdapters extends Partial<Readonly<Record<string, Validator>>>,
  ValuePathsToTypePaths extends Readonly<Record<string, string>>,
> = keyof TypePathsToAdapters extends ValueOf<ValuePathsToTypePaths> ? {
    readonly [
      K in keyof ValuePathsToTypePaths as unknown extends TypePathsToAdapters[ValuePathsToTypePaths[K]] ? never : K
    ]: NonNullable<TypePathsToAdapters[ValuePathsToTypePaths[K]]>
  }
  : never

export type FlattenedValidatorsOfType<
  T extends Type,
  Flattened extends Readonly<Record<string, Type>> = FlattenedTypesOfType<T, '*'>,
> = {
  [K in keyof Flattened]: Validator
}

export function flattenValidationsOfType<
  T extends Type,
  ValueToTypePaths extends Readonly<Record<string, string>>,
  TypePathsToValidators extends FlattenedTypePathsToValidatorsOf<
    FlattenedValuesOfType<T, '*'>,
    ValueOfType<ReadonlyTypeOfType<T>>
  >,
  ValuePathsToValidators extends ValuePathsToValidatorsOf<TypePathsToValidators, ValueToTypePaths> =
    ValuePathsToValidatorsOf<
      TypePathsToValidators,
      ValueToTypePaths
    >,
>(
  type: T,
  value: ValueOfType<T>,
  validators: TypePathsToValidators,
): ValidationsOfFlattenedValidators<ValuePathsToValidators> {
  return flattenValueTypeTo(
    type,
    value,
    () => {},
    function (
      _t: StrictTypeDef,
      v: AnyValueType,
      _setter: Setter<AnyValueType>,
      typePath: string,
      valuePath: string,
    ) {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const validator = validators[typePath as keyof TypePathsToValidators]
      return validator?.(v, valuePath, value)
    },
  )
}

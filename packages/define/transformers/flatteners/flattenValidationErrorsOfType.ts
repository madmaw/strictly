import { type AnyValueType } from 'transformers/copies/copyTo'
import {
  flattenValueTo,
  type Setter,
} from 'transformers/flatteners/flattenValueTo'
import {
  type ReadonlyDeep,
  type ValueOf,
} from 'type-fest'
import { type FlattenedTypesOfType } from 'types/FlattenedTypesOfType'
import { type FlattenedValuesOfType } from 'types/FlattenedValuesOfType'
import { type ReadonlyTypeOfType } from 'types/ReadonlyTypeOfType'
import { type StrictTypeDef } from 'types/StrictType'
import { type Type } from 'types/Type'
import { type ValueOfType } from 'types/ValueOfType'
import {
  validate,
  type Validator,
} from 'validation/validator'

type ErrorOfValidator<V extends Validator> = V extends Validator<infer _V, infer E> ? E | null : never

export type ErrorsOfFlattenedValidators<
  TypePathsToValidators extends Readonly<Record<string, Validator>>,
> = {
  [K in keyof TypePathsToValidators]: ErrorOfValidator<TypePathsToValidators[K]>
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

export function flattenValidationErrorsOfType<
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
  listIndicesToKeys?: Record<string, number[]>,
): ErrorsOfFlattenedValidators<ValuePathsToValidators> {
  return flattenValueTo(
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
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return validator != null ? validate(validator as Validator, v, valuePath, value) : null
    },
    listIndicesToKeys,
  )
}

import { type AnyValueType } from 'define/transformers/copies/copyTo'
import {
  flattenValueTo,
  type Setter,
} from 'define/transformers/flatteners/flattenValueTo'
import { type FlattenedTypesOfType } from 'define/types/FlattenedTypesOfType'
import { type FlattenedValuesOfType } from 'define/types/FlattenedValuesOfType'
import { type ReadonlyTypeOfType } from 'define/types/ReadonlyTypeOfType'
import { type Type } from 'define/types/Type'
import { type ValueOfType } from 'define/types/ValueOfType'
import { validate, type Validator } from 'define/validation/validator'
import { type ValueOf } from 'type-fest'

type ErrorOfValidator<V extends Validator> =
  V extends Validator<infer _V, infer E> ? E | null : never

export type ErrorsOfFlattenedValidators<
  TypePathsToValidators extends Readonly<Record<string, Validator>>,
> = {
  [K in keyof TypePathsToValidators]: ErrorOfValidator<TypePathsToValidators[K]>
}

export type FlattenedTypePathsToValidatorsOf<
  // oxlint-disable-next-line typescript/no-explicit-any
  FlattenedValues extends Readonly<Record<string, any>>,
  Context,
> = {
  readonly [K in keyof FlattenedValues]?: Validator<
    FlattenedValues[K],
    any, // oxlint-disable-line typescript/no-explicit-any
    any, // oxlint-disable-line typescript/no-explicit-any
    Context
  >
}

export type ValuePathsToValidatorsOf<
  TypePathsToAdapters extends Partial<Readonly<Record<string, Validator>>>,
  ValuePathsToTypePaths extends Readonly<Record<string, string>>,
> =
  keyof TypePathsToAdapters extends ValueOf<ValuePathsToTypePaths>
    ? {
        readonly [
          K in keyof ValuePathsToTypePaths as unknown extends TypePathsToAdapters[ValuePathsToTypePaths[K]]
            ? never
            : K
        ]: NonNullable<TypePathsToAdapters[ValuePathsToTypePaths[K]]>
      }
    : never

export type FlattenedValidatorsOfType<
  T extends Type,
  Flattened extends Readonly<Record<string, Type>> = FlattenedTypesOfType<
    T,
    '*'
  >,
> = {
  [K in keyof Flattened]: Validator
}

export function flattenValidationErrorsOfType<
  T extends Type,
  ValueToTypePaths extends Readonly<Record<string, string>>,
  TypePathsToValidators extends FlattenedTypePathsToValidatorsOf<
    FlattenedValuesOfType<ReadonlyTypeOfType<T>, '*'>,
    ValueOfType<ReadonlyTypeOfType<T>>
  >,
  ValuePathsToValidators extends ValuePathsToValidatorsOf<
    TypePathsToValidators,
    ValueToTypePaths
  > = ValuePathsToValidatorsOf<TypePathsToValidators, ValueToTypePaths>,
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
    (
      _t: Type,
      v: AnyValueType,
      _setter: Setter<AnyValueType>,
      typePath: string,
      valuePath: string,
    ) => {
      const validator = validators[typePath as keyof TypePathsToValidators]
      return validator == null
        ? null
        : validate(validator as Validator, v, valuePath, value)
    },
    listIndicesToKeys,
  )
}

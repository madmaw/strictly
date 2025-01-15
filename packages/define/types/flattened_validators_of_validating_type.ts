import { type Validator } from 'validation/validator'
import { type FlattenedTypesOfType } from './flattened_types_of_type'
import {
  type ReadonlyOfTypeDef,
  type ReadonlyTypeOfType,
} from './readonly_type_of_type'
import {
  type ErrorOfValidatingTypeDef,
  type ValidatingType,
  type ValidatingTypeDef,
} from './validating_definitions'
import {
  type ValueOfType,
  type ValueOfTypeDef,
} from './value_of_type'

type ValidatorOfValidatingType<T extends ValidatingTypeDef, ValuePath extends string, Context> = T extends
  ValidatingTypeDef<infer E> ? Validator<ValueOfTypeDef<ReadonlyOfTypeDef<T>>, E, ValuePath, Context>
  : never

export type FlattenedValidatorsOfValidatingType<
  T extends ValidatingType,
  TypePathsToValuePaths extends Readonly<Record<keyof FlattenedTypes, string>>,
  FlattenedTypes extends Readonly<Record<string, ValidatingType>> = FlattenedTypesOfType<T, '*'>,
  Context = ValueOfType<ReadonlyTypeOfType<T>>,
> = {
  [K in keyof FlattenedTypes as ErrorOfValidatingTypeDef<FlattenedTypes[K]['definition']> extends never ? never : K]:
    ValidatorOfValidatingType<
      FlattenedTypes[K]['definition'],
      TypePathsToValuePaths[K],
      Context
    >
}

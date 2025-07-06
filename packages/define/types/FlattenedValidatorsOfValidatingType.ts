import { type Simplify } from 'type-fest'
import { type Validator } from 'validation/validator'
import { type FlattenedTypesOfType } from './FlattenedTypesOfType'
import {
  type ReadonlyOfTypeDef,
} from './ReadonlyTypeOfType'
import {
  type ErrorOfValidatingTypeDef,
  type ValidatingType,
  type ValidatingTypeDef,
} from './ValidatingType'
import {
  type ValueOfTypeDef,
} from './ValueOfType'

type ValidatorOfValidatingType<T extends ValidatingTypeDef, ValuePath extends string> = T extends
  ValidatingTypeDef<infer E, infer C> ? Validator<ValueOfTypeDef<ReadonlyOfTypeDef<T>>, E, ValuePath, C>
  : never

export type FlattenedValidatorsOfValidatingType<
  T extends ValidatingType,
  TypePathsToValuePaths extends Readonly<Record<keyof FlattenedTypes, string>>,
  FlattenedTypes extends Readonly<Record<string, ValidatingType>> = FlattenedTypesOfType<T, '*'>,
> // needs to simplify otherwise TS compiler dies
 = Simplify<{
  [K in keyof FlattenedTypes as ErrorOfValidatingTypeDef<FlattenedTypes[K]['definition']> extends never ? never : K]:
    ValidatorOfValidatingType<
      FlattenedTypes[K]['definition'],
      TypePathsToValuePaths[K]
    >
}>

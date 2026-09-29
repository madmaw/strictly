import { type ContextOfType, type ErrorsOfType } from 'validation/rules'
import { type Validator } from 'validation/validator'
import { type FlattenedTypesOfType } from './FlattenedTypesOfType'
import { type ReadonlyTypeOfType } from './ReadonlyTypeOfType'
import { type Type } from './Type'
import { type ValueOfType } from './ValueOfType'
import { type ValuePathsOfTypePath } from './ValuePathsOfTypePath'

type ValidatorOfType<
  T extends Type,
  ValuePath extends string,
  GlobalContext,
> = Validator<
  ValueOfType<ReadonlyTypeOfType<T>>,
  ErrorsOfType<T>,
  ValuePath,
  ContextOfType<T> & GlobalContext
>

/**
 * The validators of every path of the type that has rules attached
 */
export type FlattenedValidatorsOfValidatingType<
  T extends Type,
  ValuePathsToTypePaths extends Readonly<Record<string, string>>,
  FlattenedTypes extends Readonly<Record<string, Type>> = FlattenedTypesOfType<
    T,
    '*'
  >,
  GlobalContext = {},
> = {
  [
    K in keyof FlattenedTypes as [ErrorsOfType<FlattenedTypes[K]>] extends [
      never,
    ]
      ? never
      : K
  ]: ValidatorOfType<
    FlattenedTypes[K],
    ValuePathsOfTypePath<ValuePathsToTypePaths, K & string>,
    GlobalContext
  >
}

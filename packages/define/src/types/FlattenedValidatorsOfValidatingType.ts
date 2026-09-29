import { type Simplify } from 'type-fest'
import { type ContextOfType, type ErrorsOfType } from 'validation/rules'
import { type Validator } from 'validation/validator'
import { type FlattenedTypesOfType } from './FlattenedTypesOfType'
import { type ReadonlyTypeOfType } from './ReadonlyTypeOfType'
import { type Type } from './Type'
import { type ValueOfType } from './ValueOfType'

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
  TypePathsToValuePaths extends Readonly<Record<keyof FlattenedTypes, string>>,
  FlattenedTypes extends Readonly<Record<string, Type>> = FlattenedTypesOfType<
    T,
    '*'
  >,
  GlobalContext = {},
> = // needs to simplify otherwise TS compiler dies
  Simplify<{
    [
      K in keyof FlattenedTypes as [ErrorsOfType<FlattenedTypes[K]>] extends [
        never,
      ]
        ? never
        : K
    ]: ValidatorOfType<
      FlattenedTypes[K],
      TypePathsToValuePaths[K],
      GlobalContext
    >
  }>

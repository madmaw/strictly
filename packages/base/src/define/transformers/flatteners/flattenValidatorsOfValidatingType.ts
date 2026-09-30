import { type FlattenedTypesOfType } from 'define/types/FlattenedTypesOfType'
import { type FlattenedValidatorsOfValidatingType } from 'define/types/FlattenedValidatorsOfValidatingType'
import { unwrap } from 'define/types/node'
import { type Type } from 'define/types/Type'
import { type ValueToTypePathsOfType } from 'define/types/ValueToTypePathsOfType'
import { metaOf, validateRulesOf } from 'define/validation/rules'
import { type Validator } from 'define/validation/validator'
import { flattenTypeTo } from './flattenTypeTo'

export function flattenValidatorsOfValidatingType<
  T extends Type,
  ValuePathsToTypePaths extends Readonly<Record<string, string>> =
    ValueToTypePathsOfType<T>,
  FlattenedTypes extends Readonly<Record<string, Type>> = FlattenedTypesOfType<
    T,
    '*'
  >,
>(
  type: T,
): FlattenedValidatorsOfValidatingType<
  T,
  ValuePathsToTypePaths,
  FlattenedTypes
> {
  return flattenValidatorsOfValidatingTypeWithMutability(type)
}

export function flattenValidatorsOfValidatingTypeWithMutability<
  T extends Type,
  ValuePathsToTypePaths extends Readonly<Record<string, string>> =
    ValueToTypePathsOfType<T>,
  FlattenedTypes extends Readonly<Record<string, Type>> = FlattenedTypesOfType<
    T,
    '*'
  >,
>(
  type: T,
): FlattenedValidatorsOfValidatingType<
  T,
  ValuePathsToTypePaths,
  FlattenedTypes,
  { readonly forceMutable?: boolean }
> {
  return flattenTypeTo(type, (t): Validator => {
    // rules and annotations live on the schema inside any optional or nullable wrapper
    const inner = unwrap(t)
    const { readonly, required } = metaOf(inner)
    return {
      annotations(
        _valuePath: string,
        { forceMutable }: { forceMutable: boolean },
      ) {
        return {
          readonly: readonly && !forceMutable,
          required,
        }
      },
      validate(v, valuePath, context) {
        return validateRulesOf(inner, v, valuePath, context)
      },
    }
  })
}

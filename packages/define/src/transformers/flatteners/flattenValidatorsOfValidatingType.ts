import { type FlattenedTypesOfType } from 'types/FlattenedTypesOfType'
import { type FlattenedValidatorsOfValidatingType } from 'types/FlattenedValidatorsOfValidatingType'
import { unwrap } from 'types/node'
import { type Type } from 'types/Type'
import { metaOf, validateRulesOf } from 'validation/rules'
import { type Validator } from 'validation/validator'
import { flattenTypeTo } from './flattenTypeTo'

export function flattenValidatorsOfValidatingType<
  T extends Type,
  TypePathsToValuePaths extends Readonly<Record<keyof FlattenedTypes, string>>,
  FlattenedTypes extends Readonly<Record<string, Type>> = FlattenedTypesOfType<
    T,
    '*'
  >,
>(
  type: T,
): FlattenedValidatorsOfValidatingType<
  T,
  TypePathsToValuePaths,
  FlattenedTypes
> {
  return flattenValidatorsOfValidatingTypeWithMutability(type)
}

export function flattenValidatorsOfValidatingTypeWithMutability<
  T extends Type,
  TypePathsToValuePaths extends Readonly<Record<keyof FlattenedTypes, string>>,
  FlattenedTypes extends Readonly<Record<string, Type>> = FlattenedTypesOfType<
    T,
    '*'
  >,
>(
  type: T,
): FlattenedValidatorsOfValidatingType<
  T,
  TypePathsToValuePaths,
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

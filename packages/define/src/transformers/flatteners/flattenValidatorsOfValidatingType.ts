import { type FlattenedTypesOfValidatingType } from 'types/FlattenedTypesOfValidatingType'
import { type FlattenedValidatorsOfValidatingType } from 'types/FlattenedValidatorsOfValidatingType'
import {
  type ValidatingType,
  type ValidatingTypeDef,
} from 'types/ValidatingType'
import { type Validator } from 'validation/validator'
import { flattenTypeTo } from './flattenTypeTo'

export function flattenValidatorsOfValidatingType<
  T extends ValidatingType,
  TypePathsToValuePaths extends Readonly<Record<keyof FlattenedTypes, string>>,
  FlattenedTypes extends Readonly<Record<string, ValidatingType>> = FlattenedTypesOfValidatingType<T, '*'>,
>(type: T): FlattenedValidatorsOfValidatingType<T, TypePathsToValuePaths, FlattenedTypes> {
  return flattenValidatorsOfValidatingTypeWithMutability(type)
}

export function flattenValidatorsOfValidatingTypeWithMutability<
  T extends ValidatingType,
  TypePathsToValuePaths extends Readonly<Record<keyof FlattenedTypes, string>>,
  FlattenedTypes extends Readonly<Record<string, ValidatingType>> = FlattenedTypesOfValidatingType<T, '*'>,
>(type: T): FlattenedValidatorsOfValidatingType<T, TypePathsToValuePaths, FlattenedTypes,
  { readonly forceMutable?: boolean }>
{
  return flattenTypeTo(type, function (definition): Validator {
    const {
      rule,
      readonly,
      required,
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    } = definition as ValidatingTypeDef
    return {
      annotations: function (_valuePath: string, { forceMutable }: { forceMutable: boolean }) {
        return {
          readonly: readonly && !forceMutable,
          required,
        }
      },
      validate: rule,
    }
  })
}

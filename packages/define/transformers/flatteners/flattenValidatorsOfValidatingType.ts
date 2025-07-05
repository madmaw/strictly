import { type FlattenedTypesOfValidatingType } from 'types/FlattenedTypesOfValidatingType'
import { type FlattenedValidatorsOfValidatingType } from 'types/FlattenedValidatorsOfValidatingType'
import {
  type ValidatingType,
  type ValidatingTypeDef,
} from 'types/ValidatingDefinitions'
import { type Validator } from 'validation/validator'
import { flattenTypeTo } from './flattenTypeTo'

export function flattenValidatorsOfValidatingType<
  T extends ValidatingType,
  TypePathsToValuePaths extends Readonly<Record<keyof FlattenedTypes, string>>,
  FlattenedTypes extends Readonly<Record<string, ValidatingType>> = FlattenedTypesOfValidatingType<T, '*'>,
>(type: T): FlattenedValidatorsOfValidatingType<T, TypePathsToValuePaths, FlattenedTypes> {
  return flattenTypeTo(type, function (definition): Validator {
    const {
      rule,
      readonly,
      required,
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    } = definition as ValidatingTypeDef
    return {
      annotations: function () {
        return {
          readonly,
          required,
        }
      },
      validate: rule,
    }
  })
}

import { type FlattenedTypesOfValidatingType } from 'types/flattened_types_of_validating_type'
import { type FlattenedValidatorsOfValidatingType } from 'types/flattened_validators_of_validating_type'
import {
  type ValidatingType,
  type ValidatingTypeDef,
} from 'types/validating_definitions'
import { type Validator } from 'validation/validator'
import { flattenTypeTo } from './flatten_type_to'

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

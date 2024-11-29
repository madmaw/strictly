import { type Field } from 'types/field'
import { type FieldValidator } from 'types/field_validator'

export function minimumStringLengthFieldValidatorFactory<E, Fields extends Record<string, Field>>(
  minimumLength: number,
  error: E,
): FieldValidator<E, Fields, string> {
  return function (value: string) {
    if (value.length < minimumLength) {
      return error
    }
    return null
  }
}

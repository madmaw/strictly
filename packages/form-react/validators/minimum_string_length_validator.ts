import { type FormField } from 'types/form_field'
import { type Validator } from 'types/validator'

export function minimumStringLengthValidatorFactory<E, Fields extends Record<string, FormField>>(
  minimumLength: number,
  error: E,
): Validator<E, Fields, string> {
  return function (value: string) {
    if (value.length < minimumLength) {
      return error
    }
    return null
  }
}

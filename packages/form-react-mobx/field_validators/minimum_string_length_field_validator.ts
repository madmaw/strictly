import { type FieldValidator } from 'types/field_validator'

export function minimumStringLengthFieldValidatorFactory<E, ValuePath extends string, Context>(
  minimumLength: number,
  error: E,
): FieldValidator<string, E, ValuePath, Context> {
  return function (value: string) {
    if (value.length < minimumLength) {
      return error
    }
    return null
  }
}

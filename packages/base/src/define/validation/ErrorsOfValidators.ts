import {
  type ErrorOfValidator,
  type Validator,
} from 'define/validation/validator'

export type ErrorsOfValidators<Validators extends Record<string, Validator>> = {
  readonly [K in keyof Validators]: ErrorOfValidator<Validators[K]>
}

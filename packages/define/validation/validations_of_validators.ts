import {
  type ValidationOfValidator,
  type Validator,
} from 'validation/validator'

export type ValidationsOfValidators<
  Validators extends Record<string, Validator>,
> = {
  readonly [K in keyof Validators]: ValidationOfValidator<Validators[K]>
}

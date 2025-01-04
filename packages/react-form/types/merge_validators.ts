import { type Validator } from '@strictly/define'
import { type Simplify } from 'type-fest'

export type MergedOfValidators<
  Validators1 extends Partial<Readonly<Record<Keys, Validator>>>,
  Validators2 extends Partial<Readonly<Record<Keys, Validator>>>,
  Keys extends string = Extract<keyof Validators1 | keyof Validators2, string>,
> = Simplify<{
  readonly [K in Keys]: undefined extends Validators1[K] ? undefined extends Validators2[K]
      // validator1 and validator 2 are undefined
      ? never
      // validator 1 is undefined
    : Validators2[K]
    : undefined extends Validators2[K]
    // validator 2 is undefined
      ? Validators1[K]
    // validator 2 and validator 2 are defined
    : MergedOfValidator<NonNullable<Validators1[K]>, NonNullable<Validators2[K]>>
}>

export type MergedOfValidator<
  Validator1 extends Validator,
  Validator2 extends Validator,
> = Validator1 extends Validator<infer V, infer E1, infer P, infer C>
  ? Validator2 extends Validator<V, infer E2, P, C> ? Validator<V, E1 | E2, P, C>
  : never
  : never

export function mergeValidators<
  Validators1 extends Partial<Readonly<Record<Keys, Validator>>>,
  Validators2 extends Partial<Readonly<Record<Keys, Validator>>>,
  Keys extends string = Extract<keyof Validators1 | keyof Validators2, string>,
>(
  validators1: Validators1,
  validators2: Validators2,
): MergedOfValidators<Validators1, Validators2, Keys> {
  const validators = {
    ...validators1,
    ...validators2,
  }
  const keys1 = new Set(Object.keys(validators1))
  const keys2 = new Set(Object.keys(validators2))
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return Array.from(keys1.intersection(keys2)).reduce(
    function (validators, key) {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const validator1 = validators1[key as keyof Validators1]
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const validator2 = validators2[key as keyof Validators2]
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any
      validators[key as Keys] = function (value: any, valuePath: string, context: any) {
        const error = validator1!(value, valuePath, context)
        if (error != null) {
          return error
        }
        return validator2!(value, valuePath, context)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any
      return validators
    },
    validators,
  ) as unknown as MergedOfValidators<Validators1, Validators2, Keys>
}

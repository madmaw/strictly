import { type Simplify } from 'type-fest'

export type FunctionalValidator<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  V = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  E = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ValuePath extends string = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Context = any,
> = (v: V, valuePath: ValuePath, context: Context) => E | null

export type AnnotatedValidator<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  V = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  E = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ValuePath extends string = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Context = any,
> = {
  readonly validate: (v: V, valuePath: ValuePath, context: Context) => E | null,
  readonly annotations: (valuePath: ValuePath, context: Context) => {
    readonly required: boolean,
    readonly readonly: boolean,
  },
}

export type Validator<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  V = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  E = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ValuePath extends string = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Context = any,
> = FunctionalValidator<V, E, ValuePath, Context> | AnnotatedValidator<V, E, ValuePath, Context>

export type ErrorOfValidator<V extends Validator> = V extends Validator<infer _V, infer E> ? E : never

export type ValidationError<Type extends string, Data = {}> = Simplify<
  {
    type: Type,
  } & Data
>

export function isFunctionalValidator(v: Validator): v is FunctionalValidator {
  return typeof v === 'function'
}

export function isAnnotatedValidator(v: Validator): v is AnnotatedValidator {
  return typeof v !== 'function'
}

export function validate<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  V = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  E = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ValuePath extends string = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Context = any,
>(
  validator: Validator<V, E, ValuePath, Context>,
  v: V,
  valuePath: ValuePath,
  context: Context,
): E | null {
  if (isAnnotatedValidator(validator)) {
    return validator.validate(v, valuePath, context)
  } else {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return (validator as FunctionalValidator<V, E, ValuePath, Context>)(v, valuePath, context)
  }
}

export function annotations<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  V = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  E = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ValuePath extends string = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Context = any,
>(
  validator: Validator<V, E, ValuePath, Context>,
  valuePath: ValuePath,
  context: Context,
) {
  if (isAnnotatedValidator(validator)) {
    return validator.annotations(valuePath, context)
  } else {
    return {
      required: false,
      readonly: false,
    }
  }
}

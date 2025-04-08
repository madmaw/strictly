import { type Simplify } from 'type-fest'

export type Annotations = {
  readonly required: boolean,
  readonly readonly: boolean,
}

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
  readonly annotations: (valuePath: ValuePath, context: Context) => Annotations,
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

export function isFunctionalValidator<
  V,
  E,
  ValuePath extends string,
  Context,
>(v: Validator<V, E, ValuePath, Context>): v is FunctionalValidator<V, E, ValuePath, Context> {
  return typeof v === 'function'
}

export function isAnnotatedValidator<
  V,
  E,
  ValuePath extends string,
  Context,
>(v: Validator<V, E, ValuePath, Context>): v is AnnotatedValidator<V, E, ValuePath, Context> {
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
    return validator(v, valuePath, context)
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

export function mergeAnnotations(a1: Annotations, a2: Annotations) {
  return {
    readonly: a1.readonly || a2.readonly,
    required: a1.required || a2.required,
  }
}

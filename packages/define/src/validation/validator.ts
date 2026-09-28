import { type Simplify } from 'type-fest'
import { CompositeValidator } from './validators/CompositeValidator'

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

export function mergeValidators<
  V,
  E1,
  E2,
  P1 extends string,
  P2 extends string,
  C1,
  C2,
>(
  v1: Validator<V, E1, P1, C1>,
  v2: Validator<V, E2, P2, C2>,
): Validator<V, E1 | E2, P1 & P2, C1 & C2> {
  return new CompositeValidator<V, E1 | E2, P1 & P2, C1 & C2>(v1, v2)
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

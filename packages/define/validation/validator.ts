import { type Simplify } from 'type-fest'

export type Validator<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  V = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  E = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ValuePath extends string = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Context = any,
> = (v: V, valuePath: ValuePath, context: Context) => E | null

export type ErrorOfValidator<V extends Validator> = V extends Validator<infer _V, infer E> ? E : never

export type ValidationError<Type extends string, Data = {}> = Simplify<
  {
    type: Type,
  } & Data
>

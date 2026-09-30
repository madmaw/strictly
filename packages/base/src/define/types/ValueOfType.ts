import { type z } from 'zod'
import { type IsReadonlyType } from './ReadonlyTypeOfType'
import { type IsOptionalField, type IsReadonlyField } from './Type'

export type ValueOfType<T, Extra = {}> = InternalValueOfType<
  T,
  Extra,
  IsReadonlyType<T>
>

type InternalValueOfType<T, Extra, R extends boolean> =
  T extends z.ZodOptional<infer I>
    ? InternalValueOfType<I, Extra, R> | undefined
    : T extends z.ZodNullable<infer I>
      ? InternalValueOfType<I, Extra, R> | null
      : T extends z.ZodDefault<infer I>
        ? InternalValueOfType<I, Extra, R>
        : T extends z.ZodReadonly<infer I>
          ? Readonly<InternalValueOfType<I, Extra, R>>
          : T extends z.ZodArray<infer E>
            ? R extends true
              ? readonly InternalValueOfType<E, Extra, R>[] & Extra
              : InternalValueOfType<E, Extra, R>[] & Extra
            : T extends z.ZodRecord<infer K, infer V>
              ? ValueOfRecord<K, V, Extra, R>
              : T extends z.ZodObject<infer Shape>
                ? ValueOfObject<Shape, Extra, R>
                : T extends z.ZodUnion<infer Options>
                  ? InternalValueOfType<Options[number], Extra, R>
                  : z.core.output<T>

type ValueOfRecord<K, V, Extra, R extends boolean> = K extends z.core.$partial
  ? R extends true
    ? {
        readonly [k in KeyOfRecord<K>]?: InternalValueOfType<V, Extra, R>
      }
    : {
        [k in KeyOfRecord<K>]?: InternalValueOfType<V, Extra, R>
      }
  : R extends true
    ? {
        readonly [k in KeyOfRecord<K>]: InternalValueOfType<V, Extra, R>
      }
    : {
        [k in KeyOfRecord<K>]: InternalValueOfType<V, Extra, R>
      }

type KeyOfRecord<K> = z.core.output<K> & (string | number)

type ValueOfObject<Shape, Extra, R extends boolean> = R extends true
  ? Readonly<ValueOfShape<Shape, Extra, true>>
  : ValueOfShape<Shape, Extra, false>

type ValueOfShape<Shape, Extra, R extends boolean> = Simplify<
  {
    [
      K in keyof Shape as IsOptionalField<Shape[K]> extends true
        ? never
        : IsReadonlyField<Shape[K]> extends true
          ? never
          : K
    ]: InternalValueOfType<Shape[K], Extra, R>
  } & {
    readonly [
      K in keyof Shape as IsOptionalField<Shape[K]> extends true
        ? never
        : IsReadonlyField<Shape[K]> extends true
          ? K
          : never
    ]: InternalValueOfType<Shape[K], Extra, R>
  } & {
    [
      K in keyof Shape as IsOptionalField<Shape[K]> extends true
        ? IsReadonlyField<Shape[K]> extends true
          ? never
          : K
        : never
    ]?: InternalValueOfType<Shape[K], Extra, R>
  } & {
    readonly [
      K in keyof Shape as IsOptionalField<Shape[K]> extends true
        ? IsReadonlyField<Shape[K]> extends true
          ? K
          : never
        : never
    ]?: InternalValueOfType<Shape[K], Extra, R>
  } & Extra
>

type Simplify<T> = { [K in keyof T]: T[K] } & {}

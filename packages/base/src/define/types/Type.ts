import { type z } from 'zod'

/**
 * Any Zod schema. Definitions in this package are ordinary Zod schemas, optionally carrying
 * extra type information (rules, readonly fields) that Zod itself ignores
 */
export type Type = z.core.SomeType

declare const readonlyFieldBrand: unique symbol

/**
 * Marks the schema of an object field as not reassignable. Distinct from `z.readonly`, which makes the
 * value itself readonly: a readonly field can hold a mutable value and vice versa
 */
export type ReadonlyField<T extends Type = Type> = T & {
  readonly [readonlyFieldBrand]: true
}

export type IsReadonlyField<T> = T extends ReadonlyField
  ? true
  : Unwrap<T> extends ReadonlyField
    ? true
    : false

/**
 * Removes the wrappers that do not change the structure of the value
 */
export type Unwrap<T> =
  T extends z.ZodOptional<infer I>
    ? Unwrap<I>
    : T extends z.ZodNullable<infer I>
      ? Unwrap<I>
      : T extends z.ZodReadonly<infer I>
        ? Unwrap<I>
        : T extends z.ZodDefault<infer I>
          ? Unwrap<I>
          : T

export type IsOptionalField<T> = T extends z.ZodOptional ? true : false

/**
 * The options of a discriminated union, keyed by the literal value of the discriminator
 */
export type OptionsOfDiscriminatedUnion<
  Options extends readonly unknown[],
  Discriminator extends string,
> = UnionToIntersectionOfOptions<
  {
    [I in keyof Options]: DiscriminatorValueOf<
      Options[I],
      Discriminator
    > extends infer L
      ? L extends string
        ? { readonly [K in L]: Options[I] }
        : never
      : never
  }[number]
>

/**
 * The value of the discriminator in an option, which is the same on every option of a nested
 * discriminated union
 */
type DiscriminatorValueOf<Option, Discriminator extends string> =
  Unwrap<Option> extends z.ZodObject<infer Shape>
    ? Shape[Discriminator] extends z.ZodLiteral<infer L>
      ? L
      : never
    : Unwrap<Option> extends z.ZodDiscriminatedUnion<infer Options, string>
      ? DiscriminatorValueOf<Options[number], Discriminator>
      : never

type UnionToIntersectionOfOptions<U> = (
  U extends unknown ? (u: U) => void : never
) extends (u: infer I) => void
  ? I
  : never

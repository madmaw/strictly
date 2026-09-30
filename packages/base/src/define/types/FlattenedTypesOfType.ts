import { type UnionToIntersection } from 'type-fest'
import { type z } from 'zod'
import { type PathOf } from './PathOf'
import { type IsReadonlyType, type ReadonlyBrand } from './ReadonlyTypeOfType'
import {
  type OptionsOfDiscriminatedUnion,
  type Type,
  type Unwrap,
} from './Type'

// NOTE removing any ternary from this file improves the performance and the depth of data structure we can go to

export type FlattenedTypesOfType<
  T extends Type,
  SegmentOverride extends string | null,
  Path extends string = '$',
> = InternalFlattenedTypesOf<T, SegmentOverride, Path, IsReadonlyType<T>>

type Branded<T, R extends boolean> = R extends true ? T & ReadonlyBrand : T

type InternalFlattenedTypesOf<
  T,
  SegmentOverride extends string | null,
  Path extends string,
  R extends boolean,
> = {
  readonly [K in Path]: Branded<T, R>
} & InternalFlattenedTypesOfChildren<Unwrap<T>, SegmentOverride, Path, R>

export type InternalFlattenedTypesOfChildren<
  T,
  SegmentOverride extends string | null,
  Path extends string,
  R extends boolean,
> =
  T extends z.ZodArray<infer E>
    ? InternalFlattenedTypesOf<
        E,
        SegmentOverride,
        PathOf<Path, number, SegmentOverride>,
        R
      >
    : T extends z.ZodRecord<infer K, infer V>
      ? InternalFlattenedTypesOf<
          V,
          SegmentOverride,
          PathOf<
            Path,
            K['_zod']['output'] & (string | number),
            SegmentOverride
          >,
          R
        >
      : T extends z.ZodObject<infer Shape>
        ? InternalFlattenedTypesOfObjectChildren<
            Shape,
            SegmentOverride,
            Path,
            R
          >
        : T extends z.ZodDiscriminatedUnion<infer Options, infer D>
          ? InternalFlattenedTypesOfDiscriminatedUnionChildren<
              OptionsOfDiscriminatedUnion<Options, D>,
              SegmentOverride,
              Path,
              R
            >
          : T extends z.ZodUnion<infer Options>
            ? InternalFlattenedTypesOfUnionChildren<
                Options[number],
                SegmentOverride,
                Path,
                R
              >
            : {}

type InternalFlattenedTypesOfObjectChildren<
  Shape,
  SegmentOverride extends string | null,
  Path extends string,
  R extends boolean,
> = keyof Shape extends string
  ? UnionToIntersection<
      {
        readonly [K in keyof Shape]-?: InternalFlattenedTypesOf<
          Shape[K],
          SegmentOverride,
          PathOf<Path, K, null>,
          R
        >
      }[keyof Shape]
    >
  : never

type InternalFlattenedTypesOfDiscriminatedUnionChildren<
  Options,
  SegmentOverride extends string | null,
  Path extends string,
  R extends boolean,
> = UnionToIntersection<
  {
    readonly [K in keyof Options & string]: InternalFlattenedTypesOfChildren<
      Unwrap<Options[K]>,
      SegmentOverride,
      `${Path}:${K}`,
      R
    >
  }[keyof Options & string]
>

type InternalFlattenedTypesOfUnionChildren<
  Option,
  SegmentOverride extends string | null,
  Path extends string,
  R extends boolean,
> = UnionToIntersection<
  Option extends unknown
    ? InternalFlattenedTypesOfChildren<Unwrap<Option>, SegmentOverride, Path, R>
    : never
>

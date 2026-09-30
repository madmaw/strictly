import { type SimplifyDeep, type UnionToIntersection } from 'type-fest'
import { type z } from 'zod'
import { type PathOf } from './PathOf'
import {
  type OptionsOfDiscriminatedUnion,
  type Type,
  type Unwrap,
} from './Type'

export type ValueToTypePathsOfType<
  T extends Type,
  SegmentOverride extends string = '*',
  Path extends string = '$',
> = SimplifyDeep<InternalFlattenedTypePathsOf<T, SegmentOverride, Path, Path>>

type InternalFlattenedTypePathsOf<
  T,
  SegmentOverride extends string,
  ValuePath extends string,
  TypePath extends string,
> = {
  readonly [K in ValuePath]: TypePath
} & InternalFlattenedTypePathsOfChildren<
  Unwrap<T>,
  SegmentOverride,
  ValuePath,
  TypePath
>

type InternalFlattenedTypePathsOfChildren<
  T,
  SegmentOverride extends string,
  ValuePath extends string,
  TypePath extends string,
> =
  T extends z.ZodArray<infer E>
    ? InternalFlattenedTypePathsOf<
        E,
        SegmentOverride,
        PathOf<ValuePath, number>,
        PathOf<TypePath, number, SegmentOverride>
      >
    : T extends z.ZodRecord<infer K, infer V>
      ? InternalFlattenedTypePathsOf<
          V,
          SegmentOverride,
          PathOf<ValuePath, K['_zod']['output'] & (string | number)>,
          PathOf<
            TypePath,
            K['_zod']['output'] & (string | number),
            SegmentOverride
          >
        >
      : T extends z.ZodObject<infer Shape>
        ? InternalFlattenedTypePathsOfObjectChildren<
            Shape,
            SegmentOverride,
            ValuePath,
            TypePath
          >
        : T extends z.ZodDiscriminatedUnion<infer Options, infer D>
          ? InternalFlattenedTypePathsOfDiscriminatedUnionChildren<
              OptionsOfDiscriminatedUnion<Options, D>,
              SegmentOverride,
              ValuePath,
              TypePath
            >
          : T extends z.ZodUnion<infer Options>
            ? InternalFlattenedTypePathsOfUnionChildren<
                Options[number],
                SegmentOverride,
                ValuePath,
                TypePath
              >
            : {}

type InternalFlattenedTypePathsOfObjectChildren<
  Shape,
  SegmentOverride extends string,
  ValuePath extends string,
  TypePath extends string,
> = keyof Shape extends string
  ? UnionToIntersection<
      {
        readonly [K in keyof Shape]-?: InternalFlattenedTypePathsOf<
          Shape[K],
          SegmentOverride,
          PathOf<ValuePath, K>,
          PathOf<TypePath, K>
        >
      }[keyof Shape]
    >
  : never

type InternalFlattenedTypePathsOfDiscriminatedUnionChildren<
  Options,
  SegmentOverride extends string,
  ValuePath extends string,
  TypePath extends string,
> = UnionToIntersection<
  {
    readonly [
      K in keyof Options & string
    ]: InternalFlattenedTypePathsOfChildren<
      Unwrap<Options[K]>,
      SegmentOverride,
      `${ValuePath}:${K}`,
      `${TypePath}:${K}`
    >
  }[keyof Options & string]
>

type InternalFlattenedTypePathsOfUnionChildren<
  Option,
  SegmentOverride extends string,
  ValuePath extends string,
  TypePath extends string,
> = UnionToIntersection<
  Option extends unknown
    ? InternalFlattenedTypePathsOfChildren<
        Unwrap<Option>,
        SegmentOverride,
        ValuePath,
        TypePath
      >
    : never
>

import { type SimplifyDeep, type UnionToIntersection } from 'type-fest'
import { type z } from 'zod'
import { type Depths, type StartingDepth } from './flattened'
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
> = SimplifyDeep<
  InternalFlattenedTypePathsOf<T, SegmentOverride, Path, Path, StartingDepth>
>

type InternalFlattenedTypePathsOf<
  T,
  SegmentOverride extends string,
  ValuePath extends string,
  TypePath extends string,
  Depth extends number,
> = {
  readonly [K in ValuePath]: TypePath
} & InternalFlattenedTypePathsOfChildren<
  Unwrap<T>,
  SegmentOverride,
  ValuePath,
  TypePath,
  Depth
>

type InternalFlattenedTypePathsOfChildren<
  T,
  SegmentOverride extends string,
  ValuePath extends string,
  TypePath extends string,
  Depth extends number,
  NextDepth extends number = Depths[Depth],
> = NextDepth extends -1
  ? never
  : T extends z.ZodArray<infer E>
    ? InternalFlattenedTypePathsOf<
        E,
        SegmentOverride,
        PathOf<ValuePath, number>,
        PathOf<TypePath, number, SegmentOverride>,
        NextDepth
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
          >,
          NextDepth
        >
      : T extends z.ZodObject<infer Shape>
        ? InternalFlattenedTypePathsOfObjectChildren<
            Shape,
            SegmentOverride,
            ValuePath,
            TypePath,
            NextDepth
          >
        : T extends z.ZodDiscriminatedUnion<infer Options, infer D>
          ? InternalFlattenedTypePathsOfDiscriminatedUnionChildren<
              OptionsOfDiscriminatedUnion<Options, D>,
              SegmentOverride,
              ValuePath,
              TypePath,
              NextDepth
            >
          : T extends z.ZodUnion<infer Options>
            ? InternalFlattenedTypePathsOfUnionChildren<
                Options[number],
                SegmentOverride,
                ValuePath,
                TypePath,
                NextDepth
              >
            : {}

type InternalFlattenedTypePathsOfObjectChildren<
  Shape,
  SegmentOverride extends string,
  ValuePath extends string,
  TypePath extends string,
  Depth extends number,
> = keyof Shape extends string
  ? UnionToIntersection<
      {
        readonly [K in keyof Shape]-?: InternalFlattenedTypePathsOf<
          Shape[K],
          SegmentOverride,
          PathOf<ValuePath, K>,
          PathOf<TypePath, K>,
          Depth
        >
      }[keyof Shape]
    >
  : never

type InternalFlattenedTypePathsOfDiscriminatedUnionChildren<
  Options,
  SegmentOverride extends string,
  ValuePath extends string,
  TypePath extends string,
  Depth extends number,
> = UnionToIntersection<
  {
    readonly [
      K in keyof Options & string
    ]: InternalFlattenedTypePathsOfChildren<
      Unwrap<Options[K]>,
      SegmentOverride,
      `${ValuePath}:${K}`,
      `${TypePath}:${K}`,
      Depth
    >
  }[keyof Options & string]
>

type InternalFlattenedTypePathsOfUnionChildren<
  Option,
  SegmentOverride extends string,
  ValuePath extends string,
  TypePath extends string,
  Depth extends number,
> = UnionToIntersection<
  Option extends unknown
    ? InternalFlattenedTypePathsOfChildren<
        Unwrap<Option>,
        SegmentOverride,
        ValuePath,
        TypePath,
        Depth
      >
    : never
>

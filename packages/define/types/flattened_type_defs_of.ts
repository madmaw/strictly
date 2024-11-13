import {
  type UnionToIntersection,
} from 'type-fest'
import {
  type ListTypeDef,
  type LiteralTypeDef,
  type MapTypeDef,
  type StructuredTypeDef,
  type TypeDef,
  type TypeDefHolder,
  type UnionTypeDef,
} from './definitions'
import { type JsonPathOf } from './json_path_of'

// Unfortunately the TS compiler will infinitely loop if we don't give it a way of breaking out.
// A starting depth of 12 (the maximum) will cause performance issues while developing
type StartingDepth = 10
// Going much above a depth of 10 will also blow up
type Depths = [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]

export type FlattenedTypeDefsOf<
  T extends TypeDefHolder,
  SegmentOverride extends string | null,
  Path extends string = '$',
> = InternalFlattenedTypeDefsOf<T['typeDef'], SegmentOverride, Path, StartingDepth>

type InternalFlattenedTypeDefsOf<
  T extends TypeDef,
  SegmentOverride extends string | null,
  Path extends string,
  Depth extends number,
  NextDepth extends number = Depths[Depth],
> =
  & {
    readonly [K in Path]: TypeDefHolder<T>
  }
  & InternalFlattenedTypeDefsOfChildren<T, SegmentOverride, Path, NextDepth>

type InternalFlattenedTypeDefsOfChildren<
  T extends TypeDef,
  SegmentOverride extends string | null,
  Path extends string,
  Depth extends number,
> =
  // resolve anything too deep to `never` instead of to {} so the caller knows
  // it has explicitly failed
  Depth extends -1 ? never
    : T extends LiteralTypeDef ? InternalFlattenedTypeDefsOfLiteralChildren
    : T extends ListTypeDef ? InternalFlattenedTypeDefsOfListChildren<T, SegmentOverride, Path, Depth>
    : T extends MapTypeDef ? InternalFlattenedTypeDefsOfMapChildren<T, SegmentOverride, Path, Depth>
    : T extends StructuredTypeDef ? InternalFlattenedTypeDefsOfStructChildren<T, SegmentOverride, Path, Depth>
    : T extends UnionTypeDef ? InternalFlattenedTypeDefsOfUnionChildren<T, SegmentOverride, Path, Depth>
    : never

type InternalFlattenedTypeDefsOfLiteralChildren = {}

type InternalFlattenedTypeDefsOfListChildren<
  T extends ListTypeDef,
  SegmentOverride extends string | null,
  Path extends string,
  Depth extends number,
> = InternalFlattenedTypeDefsOf<
  T['elements'],
  SegmentOverride,
  JsonPathOf<Path, number, SegmentOverride>,
  Depth
>

type InternalFlattenedTypeDefsOfMapChildren<
  T extends MapTypeDef,
  SegmentOverride extends string | null,
  Path extends string,
  Depth extends number,
> = InternalFlattenedTypeDefsOf<
  T['valueTypeDef'],
  SegmentOverride,
  JsonPathOf<Path, T['keyPrototype'], SegmentOverride>,
  Depth
>

type InternalFlattenedTypeDefsOfStructChildren<
  T extends StructuredTypeDef,
  SegmentOverride extends string | null,
  Path extends string,
  Depth extends number,
> = T extends StructuredTypeDef<infer Fields> ? {} extends Fields ? {}
  : UnionToIntersection<{
    readonly [K in keyof Fields]-?: InternalFlattenedTypeDefsOf<
      Exclude<Fields[K], undefined>,
      SegmentOverride,
      JsonPathOf<Path, K>,
      Depth
    >
  }[keyof Fields]>
  : never

type InternalFlattenedTypeDefsOfUnionChildren<
  T extends UnionTypeDef,
  SegmentOverride extends string | null,
  Path extends string,
  Depth extends number,
> = T extends UnionTypeDef<infer _D, infer Unions> ? {
    [K in keyof Unions]: InternalFlattenedTypeDefsOfChildren<
      Unions[K],
      SegmentOverride,
      Path,
      Depth
    >
  }[keyof Unions]
  : never

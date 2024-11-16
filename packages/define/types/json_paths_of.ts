import {
  type ListTypeDef,
  type LiteralTypeDef,
  type MapTypeDef,
  type StructuredTypeDef,
  type TypeDef,
  type TypeDefHolder,
  type UnionTypeDef,
} from './definitions'
import {
  type Depths,
  type StartingDepth,
} from './flattened'
import { type JsonPathOf } from './json_path_of'

export type JsonPathsOf<
  T extends TypeDefHolder,
  SegmentOverride extends string | null = null,
  Prefix extends string = '$',
> = InternalJsonPathsOf<T['typeDef'], Prefix, SegmentOverride, StartingDepth>

export type InternalJsonPathsOf<
  F extends TypeDef,
  Prefix extends string,
  SegmentOverride extends string | null,
  // TODO maybe depth isn't necessary here?
  Depth extends number,
  NextDepth extends number = Depths[Depth],
> = InternalJsonPathsOfChildren<F, Prefix, SegmentOverride, NextDepth> | Prefix

type InternalJsonPathsOfChildren<
  F extends TypeDef,
  Prefix extends string,
  SegmentOverride extends string | null,
  Depth extends number,
> = Depth extends -1 ? never
  : F extends LiteralTypeDef ? InternalJsonPathsOfLiteralChildren
  : F extends ListTypeDef ? InternalJsonPathsOfListChildren<F, Prefix, SegmentOverride, Depth>
  : F extends MapTypeDef ? InternalJsonPathsOfMapChildren<F, Prefix, SegmentOverride, Depth>
  : F extends StructuredTypeDef ? InternalJsonPathsOfStructChildren<F, Prefix, SegmentOverride, Depth>
  : F extends UnionTypeDef ? InternalJsonPathsOfUnionChildren<
      F,
      Prefix,
      SegmentOverride,
      Depth
    >
  : never

type InternalJsonPathsOfLiteralChildren = never

type InternalJsonPathsOfListChildren<
  F extends ListTypeDef,
  Prefix extends string,
  SegmentOverride extends string | null,
  Depth extends number,
> = InternalJsonPathsOf<
  F['elements'],
  JsonPathOf<
    Prefix,
    number,
    SegmentOverride
  >,
  SegmentOverride,
  Depth
>

type InternalJsonPathsOfMapChildren<
  F extends MapTypeDef,
  Prefix extends string,
  SegmentOverride extends string | null,
  Depth extends number,
> = InternalJsonPathsOf<
  F['valueTypeDef'],
  JsonPathOf<
    Prefix,
    F['keyPrototype'],
    SegmentOverride
  >,
  SegmentOverride,
  Depth
>

type InternalJsonPathsOfStructChildren<
  F extends StructuredTypeDef,
  Prefix extends string,
  SegmentOverride extends string | null,
  Depth extends number,
> = F extends StructuredTypeDef<infer Fields> ? {
    [K in keyof Fields]: InternalJsonPathsOf<
      Fields[K],
      JsonPathOf<
        Prefix,
        K
      >,
      SegmentOverride,
      Depth
    >
  }[keyof Fields]
  : never

type InternalJsonPathsOfUnionChildren<
  F extends UnionTypeDef,
  Prefix extends string,
  SegmentOverride extends string | null,
  Depth extends number,
> // typescript cannot infer the key in unions unless we get the value directly
 = F extends UnionTypeDef<infer D, infer Unions> ? {
    readonly [K in keyof Unions]: InternalJsonPathsOf<
      Unions[K],
      // This will overload paths, but we don't actually care about that here
      // I think what we should do is have a "denormalize of", which you can then
      // get the paths of if you want the unique paths
      // (alt PrefixOf<Prefix, K>,)
      Prefix,
      SegmentOverride,
      Depth
    >
  }[keyof Unions] | (D extends string ? JsonPathOf<Prefix, D> : never)
  : never

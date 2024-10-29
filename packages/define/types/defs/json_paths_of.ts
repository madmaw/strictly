import {
  type ListTypeDef,
  type LiteralTypeDef,
  type MapTypeDef,
  type NullableTypeDef,
  type StructuredTypeDef,
  type TypeDef,
  type TypeDefHolder,
  type UnionTypeDef,
} from '.'
import { type JsonPathOf } from './json_path_of'

export type JsonPathsOf<
  T extends TypeDefHolder,
  SegmentOverride extends string | null = null,
  Prefix extends string = '$',
> = InternalJsonPathsOf<T['typeDef'], Prefix, SegmentOverride>

type InternalJsonPathsOf<
  F extends TypeDef,
  Prefix extends string,
  SegmentOverride extends string | null,
> = InternalJsonPathsOfChildren<F, Prefix, SegmentOverride> | Prefix

type InternalJsonPathsOfChildren<
  F extends TypeDef,
  Prefix extends string,
  SegmentOverride extends string | null,
> = F extends LiteralTypeDef ? InternalJsonPathsOfLiteralChildren
  : F extends NullableTypeDef ? InternalJsonPathsOfNullableChildren<F, Prefix, SegmentOverride>
  : F extends ListTypeDef ? InternalJsonPathsOfListChildren<F, Prefix, SegmentOverride>
  : F extends MapTypeDef ? InternalJsonPathsOfMapChildren<F, Prefix, SegmentOverride>
  : F extends StructuredTypeDef ? InternalJsonPathsOfStructChildren<F, Prefix, SegmentOverride>
  : F extends UnionTypeDef ? InternalJsonPathsOfUnionChildren<
      F,
      Prefix,
      SegmentOverride
    >
  : never

type InternalJsonPathsOfLiteralChildren = never

type InternalJsonPathsOfNullableChildren<
  F extends NullableTypeDef,
  Prefix extends string,
  SegmentOverride extends string | null = null,
> = InternalJsonPathsOfChildren<F['toNullableTypeDef'], Prefix, SegmentOverride>

type InternalJsonPathsOfListChildren<
  F extends ListTypeDef,
  Prefix extends string,
  SegmentOverride extends string | null,
> = InternalJsonPathsOf<
  F['elements'],
  JsonPathOf<
    Prefix,
    number,
    SegmentOverride
  >,
  SegmentOverride
>

type InternalJsonPathsOfMapChildren<
  F extends MapTypeDef,
  Prefix extends string,
  SegmentOverride extends string | null,
> = InternalJsonPathsOf<
  F['valueTypeDef'],
  JsonPathOf<
    Prefix,
    F['keyPrototype'],
    SegmentOverride
  >,
  SegmentOverride
>

type InternalJsonPathsOfStructChildren<
  F extends StructuredTypeDef,
  Prefix extends string,
  SegmentOverride extends string | null,
> = F extends StructuredTypeDef<infer Fields> ? {
    [K in keyof Fields]: InternalJsonPathsOf<
      Fields[K],
      JsonPathOf<
        Prefix,
        K
      >,
      SegmentOverride
    >
  }[keyof Fields]
  : never

type InternalJsonPathsOfUnionChildren<
  F extends UnionTypeDef,
  Prefix extends string,
  SegmentOverride extends string | null,
> // typescript cannot infer the key in unions unless we get the value directly
 = F extends UnionTypeDef<infer Unions> ? {
    readonly [K in keyof Unions]: InternalJsonPathsOf<
      Unions[K],
      // This will overload paths, but we don't actually care about that here
      // I think what we should do is have a "denormalize of", which you can then
      // get the paths of if you want the unique paths
      // (alt PrefixOf<Prefix, K>,)
      Prefix,
      SegmentOverride
    >
  }[keyof Unions]
  : never

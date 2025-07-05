import {
  type ListTypeDef,
  type LiteralTypeDef,
  type ObjectTypeDef,
  type RecordTypeDef,
  type Type,
  type TypeDef,
  type UnionTypeDef,
} from './Definitions'
import {
  type Depths,
  type StartingDepth,
} from './Flattened'
import { type PathOf } from './PathOf'

export type PathsOfType<
  T extends Type,
  SegmentOverride extends string | null = null,
  Prefix extends string = '$',
> = InternalJsonPathsOf<T['definition'], Prefix, SegmentOverride, StartingDepth>

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
  : F extends RecordTypeDef ? InternalJsonPathsOfRecordChildren<F, Prefix, SegmentOverride, Depth>
  : F extends ObjectTypeDef ? InternalJsonPathsOfObjectChildren<F, Prefix, SegmentOverride, Depth>
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
  PathOf<
    Prefix,
    number,
    SegmentOverride
  >,
  SegmentOverride,
  Depth
>

type InternalJsonPathsOfRecordChildren<
  F extends RecordTypeDef,
  Prefix extends string,
  SegmentOverride extends string | null,
  Depth extends number,
> = InternalJsonPathsOf<
  F['valueTypeDef'],
  PathOf<
    Prefix,
    F['keyPrototype'],
    SegmentOverride
  >,
  SegmentOverride,
  Depth
>

type InternalJsonPathsOfObjectChildren<
  F extends ObjectTypeDef,
  Prefix extends string,
  SegmentOverride extends string | null,
  Depth extends number,
> = F extends ObjectTypeDef<infer Fields> ? {
    [K in keyof Fields]: InternalJsonPathsOf<
      Fields[K],
      PathOf<
        Prefix,
        K,
        null
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
 = F extends UnionTypeDef<infer D, infer Unions> ? keyof Unions extends string ? {
      readonly [K in keyof Unions]: InternalJsonPathsOfChildren<
        Unions[K],
        // This will overload paths, but we don't actually care about that here
        // I think what we should do is have a "denormalize of", which you can then
        // get the paths of if you want the unique paths
        // (alt PrefixOf<Prefix, K>,)
        D extends null ? Prefix : `${Prefix}:${K}`,
        SegmentOverride,
        Depth
      >
    }[keyof Unions]
    // do not expose the discriminator as we cannot set this value independently
    //  | (D extends string ? JsonPathOf<Prefix, D, null> : never)
  : never
  : never

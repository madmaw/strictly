import {
  type ListTypeDef,
  type LiteralTypeDef,
  type ObjectTypeDef,
  type RecordTypeDef,
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
> = InternalJsonPathsOfChildren<F, Prefix, SegmentOverride, '', NextDepth> | Prefix

type InternalJsonPathsOfChildren<
  F extends TypeDef,
  Prefix extends string,
  SegmentOverride extends string | null,
  Qualifier extends string,
  Depth extends number,
> = Depth extends -1 ? never
  : F extends LiteralTypeDef ? InternalJsonPathsOfLiteralChildren
  : F extends ListTypeDef ? InternalJsonPathsOfListChildren<F, Prefix, SegmentOverride, Depth>
  : F extends RecordTypeDef ? InternalJsonPathsOfRecordChildren<F, Prefix, SegmentOverride, Depth>
  : F extends ObjectTypeDef ? InternalJsonPathsOfObjectChildren<F, Prefix, SegmentOverride, Qualifier, Depth>
  : F extends UnionTypeDef ? InternalJsonPathsOfUnionChildren<
      F,
      Prefix,
      SegmentOverride,
      Qualifier,
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

type InternalJsonPathsOfRecordChildren<
  F extends RecordTypeDef,
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

type InternalJsonPathsOfObjectChildren<
  F extends ObjectTypeDef,
  Prefix extends string,
  SegmentOverride extends string | null,
  Qualifier extends string,
  Depth extends number,
> = F extends ObjectTypeDef<infer Fields> ? keyof Fields extends string ? {
      [K in keyof Fields]: InternalJsonPathsOf<
        Fields[K],
        JsonPathOf<
          Prefix,
          `${Qualifier}${K}`,
          null
        >,
        SegmentOverride,
        Depth
      >
    }[keyof Fields]
  : never
  : never

type InternalJsonPathsOfUnionChildren<
  F extends UnionTypeDef,
  Prefix extends string,
  SegmentOverride extends string | null,
  Qualifier extends string,
  Depth extends number,
> // typescript cannot infer the key in unions unless we get the value directly
 = F extends UnionTypeDef<infer D, infer Unions> ? keyof Unions extends string ? {
      readonly [K in keyof Unions]: InternalJsonPathsOfChildren<
        Unions[K],
        // This will overload paths, but we don't actually care about that here
        // I think what we should do is have a "denormalize of", which you can then
        // get the paths of if you want the unique paths
        // (alt PrefixOf<Prefix, K>,)
        Prefix,
        SegmentOverride,
        D extends null ? Qualifier : `${Qualifier}${K}:`,
        Depth
      >
    }[keyof Unions]
    // do not expose the discriminator as we cannot set this value independently
    //  | (D extends string ? JsonPathOf<Prefix, D, null, Qualifier> : never)
  : never
  : never

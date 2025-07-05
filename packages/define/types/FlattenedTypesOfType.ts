import {
  type UnionToIntersection,
} from 'type-fest'
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

// NOTE removing any ternary from this file improves the performance and the depth of data structure we can go to

export type FlattenedTypesOfType<
  T extends Type,
  SegmentOverride extends string | null,
  Path extends string = '$',
  Depth extends number = StartingDepth,
> = InternalFlattenedTypeDefsOf<T['definition'], SegmentOverride, Path, Depth>

type InternalFlattenedTypeDefsOf<
  T extends TypeDef,
  SegmentOverride extends string | null,
  Path extends string,
  Depth extends number,
> =
  & {
    readonly [K in Path]: Type<T>
  }
  & InternalFlattenedTypeDefsOfChildren<T, SegmentOverride, Path, Depth>

type InternalFlattenedTypeDefsOfChildren<
  T extends TypeDef,
  SegmentOverride extends string | null,
  Path extends string,
  Depth extends number,
  NextDepth extends number = Depths[Depth],
> =
  // resolve anything too deep to `never` instead of to {} so the caller knows
  // it has explicitly failed
  NextDepth extends -1 ? never
    : T extends LiteralTypeDef ? InternalFlattenedTypeDefsOfLiteralChildren
    : T extends ListTypeDef ? InternalFlattenedTypeDefsOfListChildren<T, SegmentOverride, Path, NextDepth>
    : T extends RecordTypeDef ? InternalFlattenedTypeDefsOfRecordChildren<T, SegmentOverride, Path, NextDepth>
    : T extends ObjectTypeDef ? InternalFlattenedTypeDefsOfObjectChildren<T, SegmentOverride, Path, NextDepth>
    : T extends UnionTypeDef ? InternalFlattenedTypeDefsOfUnionChildren<T, SegmentOverride, Path, NextDepth>
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
  PathOf<Path, number, SegmentOverride>,
  Depth
>

type InternalFlattenedTypeDefsOfRecordChildren<
  T extends RecordTypeDef,
  SegmentOverride extends string | null,
  Path extends string,
  Depth extends number,
> = InternalFlattenedTypeDefsOf<
  T['valueTypeDef'],
  SegmentOverride,
  PathOf<Path, T['keyPrototype'], SegmentOverride>,
  Depth
>

type InternalFlattenedTypeDefsOfObjectChildren<
  T extends ObjectTypeDef,
  SegmentOverride extends string | null,
  Path extends string,
  Depth extends number,
> = T extends ObjectTypeDef<infer Fields> ? keyof Fields extends string ? UnionToIntersection<{
      readonly [K in keyof Fields]-?: undefined extends Fields[K] ? InternalFlattenedTypeDefsOf<
          UnionTypeDef<null, {
            readonly '0': Exclude<Fields[K], undefined>,
            readonly '1': LiteralTypeDef<undefined>,
          }>,
          SegmentOverride,
          PathOf<Path, K, null>,
          Depth
        >
        : InternalFlattenedTypeDefsOf<
          Exclude<Fields[K], undefined>,
          SegmentOverride,
          PathOf<Path, K, null>,
          Depth
        >
    }[keyof Fields]>
  : never
  : never

type InternalFlattenedTypeDefsOfUnionChildren<
  T extends UnionTypeDef,
  SegmentOverride extends string | null,
  Path extends string,
  Depth extends number,
> = T extends UnionTypeDef<infer D, infer Unions> ? keyof Unions extends string ? D extends null ? UnionToIntersection<{
        readonly [K in keyof Unions]: InternalFlattenedTypeDefsOfChildren<
          Unions[K],
          SegmentOverride,
          Path,
          Depth
        >
      }[keyof Unions]>
    : UnionToIntersection<{
      readonly [K in keyof Unions]: InternalFlattenedTypeDefsOfChildren<
        Unions[K],
        SegmentOverride,
        `${Path}:${K}`,
        Depth
      >
    }[keyof Unions]>
  : never
  : never

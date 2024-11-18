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
import {
  type Depths,
  type StartingDepth,
} from './flattened'
import { type JsonPathOf } from './json_path_of'

export type FlattenedTypeDefsOf<
  T extends TypeDefHolder,
  SegmentOverride extends string | null,
  Path extends string = '$',
> = InternalFlattenedTypeDefsOf<T['typeDef'], SegmentOverride, Path, '', StartingDepth>

type InternalFlattenedTypeDefsOf<
  T extends TypeDef,
  SegmentOverride extends string | null,
  Path extends string,
  Qualifier extends string,
  Depth extends number,
> =
  & {
    readonly [K in Path]: TypeDefHolder<T>
  }
  & InternalFlattenedTypeDefsOfChildren<T, SegmentOverride, Path, Qualifier, Depth>

type InternalFlattenedTypeDefsOfChildren<
  T extends TypeDef,
  SegmentOverride extends string | null,
  Path extends string,
  Qualifier extends string,
  Depth extends number,
  NextDepth extends number = Depths[Depth],
> =
  // resolve anything too deep to `never` instead of to {} so the caller knows
  // it has explicitly failed
  NextDepth extends -1 ? never
    : T extends LiteralTypeDef ? InternalFlattenedTypeDefsOfLiteralChildren
    : T extends ListTypeDef ? InternalFlattenedTypeDefsOfListChildren<T, SegmentOverride, Path, NextDepth>
    : T extends MapTypeDef ? InternalFlattenedTypeDefsOfMapChildren<T, SegmentOverride, Path, NextDepth>
    : T extends StructuredTypeDef
      ? InternalFlattenedTypeDefsOfStructChildren<T, SegmentOverride, Path, Qualifier, NextDepth>
    : T extends UnionTypeDef ? InternalFlattenedTypeDefsOfUnionChildren<T, SegmentOverride, Path, Qualifier, NextDepth>
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
  '',
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
  '',
  Depth
>

type InternalFlattenedTypeDefsOfStructChildren<
  T extends StructuredTypeDef,
  SegmentOverride extends string | null,
  Path extends string,
  Qualifier extends string,
  Depth extends number,
> // TODO suspect these `extends` checks are counting toward the limit of 50 operations, remove
 = T extends StructuredTypeDef<infer Fields>
  ? {} extends Fields ? {} : keyof Fields extends string ? UnionToIntersection<{
      readonly [K in keyof Fields]-?: InternalFlattenedTypeDefsOf<
        Exclude<Fields[K], undefined>,
        SegmentOverride,
        JsonPathOf<Path, `${Qualifier}${K}`, null>,
        '',
        Depth
      >
    }[keyof Fields]>
  : never
  : never

type InternalFlattenedTypeDefsOfUnionChildren<
  T extends UnionTypeDef,
  SegmentOverride extends string | null,
  Path extends string,
  Qualifier extends string,
  Depth extends number,
> = T extends UnionTypeDef<infer D, infer Unions> ? keyof Unions extends string ? D extends null ? {
        readonly [K in keyof Unions]: InternalFlattenedTypeDefsOfChildren<
          Unions[K],
          SegmentOverride,
          Path,
          '',
          Depth
        >
      }[keyof Unions]
    : UnionToIntersection<{
      readonly [K in keyof Unions]: InternalFlattenedTypeDefsOfChildren<
        Unions[K],
        SegmentOverride,
        Path,
        `${Qualifier}${K}:`,
        Depth
      >
    }[keyof Unions]>
  : never
  : never

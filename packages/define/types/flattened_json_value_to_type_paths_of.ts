import { type ReadonlyRecord } from '@de/base'
import { type UnionToIntersection } from 'type-fest'
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

export type FlattenedJsonValueToTypePathsOf<
  T extends TypeDefHolder,
  SegmentOverride extends string = '*',
  Path extends string = '$',
> = InternalFlattenedJsonPathsOf<
  T['typeDef'],
  SegmentOverride,
  Path,
  Path,
  StartingDepth
>
type InternalFlattenedJsonPathsOf<
  T extends TypeDef,
  SegmentOverride extends string,
  ValuePath extends string,
  TypePath extends string,
  Depth extends number,
  NextDepth extends number = Depths[Depth],
> =
  & {
    readonly [K in ValuePath]: TypePath
  }
  & InternalFlattenedJsonPathsOfChildren<T, SegmentOverride, ValuePath, TypePath, NextDepth>

type InternalFlattenedJsonPathsOfChildren<
  T extends TypeDef,
  SegmentOverride extends string,
  ValuePath extends string,
  TypePath extends string,
  Depth extends number,
> = Depth extends -1 ? never
  : T extends LiteralTypeDef ? InternalFlattenedJsonPathsOfLiteralChildren
  : T extends ListTypeDef ? InternalFlattenedJsonPathsOfListChildren<
      T,
      SegmentOverride,
      ValuePath,
      TypePath,
      Depth
    >
  : T extends MapTypeDef ? InternalFlattenedJsonPathsOfMapChildren<
      T,
      SegmentOverride,
      ValuePath,
      TypePath,
      Depth
    >
  : T extends StructuredTypeDef ? InternalFlattenedJsonPathsOfStructChildren<
      T,
      SegmentOverride,
      ValuePath,
      TypePath,
      Depth
    >
  : T extends UnionTypeDef ? InternalFlattenedJsonPathsOfUnionChildren<
      T,
      SegmentOverride,
      ValuePath,
      TypePath,
      Depth
    >
  : never

type InternalFlattenedJsonPathsOfLiteralChildren = {}

type InternalFlattenedJsonPathsOfListChildren<
  T extends ListTypeDef,
  SegmentOverride extends string,
  ValuePath extends string,
  TypePath extends string,
  Depth extends number,
> = InternalFlattenedJsonPathsOf<
  T['elements'],
  SegmentOverride,
  JsonPathOf<ValuePath, number>,
  JsonPathOf<TypePath, number, SegmentOverride>,
  Depth
>

type InternalFlattenedJsonPathsOfMapChildren<
  T extends MapTypeDef,
  SegmentOverride extends string,
  ValuePath extends string,
  TypePath extends string,
  Depth extends number,
> = InternalFlattenedJsonPathsOf<
  T['valueTypeDef'],
  SegmentOverride,
  JsonPathOf<ValuePath, T['keyPrototype']>,
  JsonPathOf<TypePath, T['keyPrototype'], SegmentOverride>,
  Depth
>

type InternalFlattenedJsonPathsOfStructChildren<
  T extends StructuredTypeDef,
  SegmentOverride extends string,
  ValuePath extends string,
  TypePath extends string,
  Depth extends number,
> = T extends StructuredTypeDef<infer Fields> ? UnionToIntersection<
    {
      [K in keyof Fields]-?: InternalFlattenedJsonPathsOf<
        Exclude<Fields[K], undefined>,
        SegmentOverride,
        JsonPathOf<ValuePath, K>,
        JsonPathOf<TypePath, K>,
        Depth
      >
    }[keyof Fields]
  >
  : never

type InternalFlattenedJsonPathsOfUnionChildren<
  T extends UnionTypeDef,
  SegmentOverride extends string,
  ValuePath extends string,
  TypePath extends string,
  Depth extends number,
> = T extends UnionTypeDef<infer D, infer Unions> ?
    & ({
      [K in keyof Unions]: InternalFlattenedJsonPathsOfChildren<
        Unions[K],
        SegmentOverride,
        ValuePath,
        TypePath,
        Depth
      >
    }[keyof Unions])
    & (D extends string ? ReadonlyRecord<JsonPathOf<ValuePath, D>, JsonPathOf<TypePath, D>> : {})
  : never

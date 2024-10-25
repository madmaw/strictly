import {
  type UnionToIntersection,
} from 'type-fest'
import { type ReadonlyRecord } from 'util/record'
import {
  type ListTypeDef,
  type LiteralTypeDef,
  type MapTypeDef,
  type NullableTypeDef,
  type PartialTypeDef,
  type ReadonlyTypeDef,
  type StructuredTypeDef,
  type TypeDef,
  type TypeDefHolder,
  type UnionTypeDef,
} from '.'
import { type JsonPathOf } from './json_path_of'

export type FlattenedTypeDefsOf<
  T extends TypeDefHolder,
  SegmentOverride extends string | null,
  Path extends string = '$',
> = InternalFlattenedTypeDefsOf<T['typeDef'], SegmentOverride, Path>

type InternalFlattenedTypeDefsOf<
  T extends TypeDef,
  SegmentOverride extends string | null,
  Path extends string,
> =
  & ReadonlyRecord<
    Path,
    T
  >
  & InternalFlattenedTypeDefsOfChildren<T, SegmentOverride, Path>

type InternalFlattenedTypeDefsOfChildren<
  T extends TypeDef,
  SegmentOverride extends string | null,
  Path extends string,
> = T extends LiteralTypeDef ? InternalFlattenedTypeDefsOfLiteralChildren
  : T extends ListTypeDef ? InternalFlattenedTypeDefsOfListChildren<T, SegmentOverride, Path>
  : T extends MapTypeDef ? InternalFlattenedTypeDefsOfMapChildren<T, SegmentOverride, Path>
  : T extends StructuredTypeDef ? InternalFlattenedTypeDefsOfStructChildren<T, SegmentOverride, Path>
  : T extends UnionTypeDef ? InternalFlattenedTypeDefsOfUnionChildren<T, SegmentOverride, Path>
  : T extends ReadonlyTypeDef ? InternalFlattenedTypeDefsOfReadonlyChildren<T, SegmentOverride, Path>
  : T extends PartialTypeDef ? InternalFlattenedTypeDefsOfPartialChildren<T, SegmentOverride, Path>
  : T extends NullableTypeDef ? InternalFlattenedTypeDefsOfNullableChildren<T, SegmentOverride, Path>
  : never

type InternalFlattenedTypeDefsOfLiteralChildren = {}

type InternalFlattenedTypeDefsOfListChildren<
  T extends ListTypeDef,
  SegmentOverride extends string | null,
  Path extends string,
> = InternalFlattenedTypeDefsOf<
  T['elements'],
  SegmentOverride,
  JsonPathOf<Path, number, SegmentOverride>
>

type InternalFlattenedTypeDefsOfMapChildren<
  T extends MapTypeDef,
  SegmentOverride extends string | null,
  Path extends string,
> = InternalFlattenedTypeDefsOf<
  T['valueTypeDef'],
  SegmentOverride,
  JsonPathOf<Path, T['keyPrototype'], SegmentOverride>
>

type InternalFlattenedTypeDefsOfStructChildren<
  T extends StructuredTypeDef,
  SegmentOverride extends string | null,
  Path extends string,
> =
  // Breaking this up seems to help the TS language service cache the results
  // and not grind to a halt
  UnionToIntersection<InternalFlattenedTypesOfStructChildrenUnion<T, SegmentOverride, Path>>

type InternalFlattenedTypesOfStructChildrenUnion<
  T extends StructuredTypeDef,
  SegmentOverride extends string | null,
  Path extends string,
> = T extends StructuredTypeDef<infer Fields> ? {} extends Fields ? {}
  : {
    readonly [K in keyof Fields]-?: InternalFlattenedTypeDefsOf<
      Exclude<Fields[K], undefined>,
      SegmentOverride,
      JsonPathOf<Path, K>
    >
  }[keyof Fields]
  : never

type InternalFlattenedTypeDefsOfUnionChildren<
  T extends UnionTypeDef,
  SegmentOverride extends string | null,
  Path extends string,
> = T extends UnionTypeDef<infer Unions> ? {
    [K in keyof Unions]: InternalFlattenedTypeDefsOfChildren<
      Unions[K],
      SegmentOverride,
      Path
    >
  }[keyof Unions]
  : never

type InternalFlattenedTypeDefsOfReadonlyChildren<
  T extends ReadonlyTypeDef,
  SegmentOverride extends string | null,
  Path extends string,
> = InternalFlattenedTypeDefsOfChildren<T['toReadonlyTypeDef'], SegmentOverride, Path>

type InternalFlattenedTypeDefsOfPartialChildren<
  T extends PartialTypeDef,
  SegmentOverride extends string | null,
  Path extends string,
> = InternalFlattenedTypeDefsOfChildren<T['toPartialTypeDef'], SegmentOverride, Path>

type InternalFlattenedTypeDefsOfNullableChildren<
  T extends NullableTypeDef,
  SegmentOverride extends string | null,
  Path extends string,
> = InternalFlattenedTypeDefsOfChildren<T['toNullableTypeDef'], SegmentOverride, Path>

import { type UnionToIntersection } from 'type-fest'
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
  type UnionTypeDef,
} from '.'
import { type JsonPathOf } from './json_path_of'

export type FlattenedJsonPathsOf<
  T extends TypeDef,
  SegmentOverride extends string = '@',
  Path extends string = '$',
> = InternalFlattenedJsonPathsOf<
  T,
  SegmentOverride,
  Path,
  Path
>
type InternalFlattenedJsonPathsOf<
  T extends TypeDef,
  SegmentOverride extends string,
  ValuePath extends string,
  TypePath extends string,
> =
  & ReadonlyRecord<ValuePath, TypePath>
  & InternalFlattenedJsonPathsOfChildren<T, SegmentOverride, ValuePath, TypePath>

type InternalFlattenedJsonPathsOfChildren<
  T extends TypeDef,
  SegmentOverride extends string,
  ValuePath extends string,
  TypePath extends string,
> = T extends LiteralTypeDef ? InternalFlattenedJsonPathsOfLiteralChildren
  : T extends ListTypeDef ? InternalFlattenedJsonPathsOfListChildren<T, SegmentOverride, ValuePath, TypePath>
  : T extends MapTypeDef ? InternalFlattenedJsonPathsOfMapChildren<T, SegmentOverride, ValuePath, TypePath>
  : T extends StructuredTypeDef ? InternalFlattenedJsonPathsOfStructChildren<T, SegmentOverride, ValuePath, TypePath>
  : T extends UnionTypeDef ? InternalFlattenedJsonPathsOfUnionChildren<T, SegmentOverride, ValuePath, TypePath>
  : T extends ReadonlyTypeDef ? InternalFlattenedJsonPathsOfReadonlyChildren<T, SegmentOverride, ValuePath, TypePath>
  : T extends PartialTypeDef ? InternalFlattenedJsonPathsOfPartialChildren<T, SegmentOverride, ValuePath, TypePath>
  : T extends NullableTypeDef ? InternalFlattenedJsonPathsOfNullableChildren<T, SegmentOverride, ValuePath, TypePath>
  : never

type InternalFlattenedJsonPathsOfLiteralChildren = {}

type InternalFlattenedJsonPathsOfListChildren<
  T extends ListTypeDef,
  SegmentOverride extends string,
  ValuePath extends string,
  TypePath extends string,
> = InternalFlattenedJsonPathsOf<
  T['elements'],
  SegmentOverride,
  JsonPathOf<ValuePath, number>,
  JsonPathOf<TypePath, number, SegmentOverride>
>

type InternalFlattenedJsonPathsOfMapChildren<
  T extends MapTypeDef,
  SegmentOverride extends string,
  ValuePath extends string,
  TypePath extends string,
> = InternalFlattenedJsonPathsOf<
  T['valueTypeDef'],
  SegmentOverride,
  JsonPathOf<ValuePath, T['keyPrototype']>,
  JsonPathOf<TypePath, T['keyPrototype'], SegmentOverride>
>

type InternalFlattenedJsonPathsOfStructChildren<
  T extends StructuredTypeDef,
  SegmentOverride extends string,
  ValuePath extends string,
  TypePath extends string,
> = T extends StructuredTypeDef<infer Fields> ? UnionToIntersection<
    {
      [K in keyof Fields]: InternalFlattenedJsonPathsOf<
        Fields[K],
        SegmentOverride,
        JsonPathOf<ValuePath, K>,
        JsonPathOf<TypePath, K>
      >
    }[keyof Fields]
  >
  : never

type InternalFlattenedJsonPathsOfUnionChildren<
  T extends UnionTypeDef,
  SegmentOverride extends string,
  ValuePath extends string,
  TypePath extends string,
> = T extends UnionTypeDef<infer Unions> ? {
    [K in keyof Unions]: InternalFlattenedJsonPathsOfChildren<
      Unions[K],
      SegmentOverride,
      ValuePath,
      TypePath
    >
  }[keyof Unions]
  : never

type InternalFlattenedJsonPathsOfReadonlyChildren<
  T extends ReadonlyTypeDef,
  SegmentOverride extends string,
  ValuePath extends string,
  TypePath extends string,
> = InternalFlattenedJsonPathsOfChildren<
  T['toReadonlyTypeDef'],
  SegmentOverride,
  ValuePath,
  TypePath
>

type InternalFlattenedJsonPathsOfPartialChildren<
  T extends PartialTypeDef,
  SegmentOverride extends string,
  ValuePath extends string,
  TypePath extends string,
> = InternalFlattenedJsonPathsOfChildren<
  T['toPartialTypeDef'],
  SegmentOverride,
  ValuePath,
  TypePath
>

type InternalFlattenedJsonPathsOfNullableChildren<
  T extends NullableTypeDef,
  SegmentOverride extends string,
  ValuePath extends string,
  TypePath extends string,
> = InternalFlattenedJsonPathsOfChildren<
  T['toNullableTypeDef'],
  SegmentOverride,
  ValuePath,
  TypePath
>

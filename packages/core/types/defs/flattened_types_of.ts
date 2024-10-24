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
  type UnionTypeDef,
} from '.'
import { type JsonPathOf } from './json_path_of'

export type FlattenedTypesOf<
  T extends TypeDef,
  Path extends string = '$',
> = InternalFlattenedTypesOf<T, Path>

type InternalFlattenedTypesOf<T extends TypeDef, Path extends string> =
  & ReadonlyRecord<
    Path,
    T
  >
  & InternalFlattenedTypesOfChildren<T, Path>

type InternalFlattenedTypesOfChildren<T extends TypeDef, Path extends string> = T extends LiteralTypeDef
  ? InternalFlattenedTypesOfLiteralChildren
  : T extends ListTypeDef ? InternalFlattenedTypesOfListChildren<T, Path>
  : T extends MapTypeDef ? InternalFlattenedTypesOfMapChildren<T, Path>
  : T extends StructuredTypeDef ? InternalFlattenedTypesOfStructChildren<T, Path>
  : T extends UnionTypeDef ? InternalFlattenedTypesOfUnionChildren<T, Path>
  : T extends ReadonlyTypeDef ? InternalFlattenedTypesOfReadonlyChildren<T, Path>
  : T extends PartialTypeDef ? InternalFlattenedTypesOfPartialChildren<T, Path>
  : T extends NullableTypeDef ? InternalFlattenedTypesOfNullableChildren<T, Path>
  : never

type InternalFlattenedTypesOfLiteralChildren = {}

type InternalFlattenedTypesOfListChildren<
  T extends ListTypeDef,
  Path extends string,
> = FlattenedTypesOf<
  T['elements'],
  JsonPathOf<Path, number>
>

type InternalFlattenedTypesOfMapChildren<
  T extends MapTypeDef,
  Path extends string,
> = FlattenedTypesOf<
  T['valueTypeDef'],
  JsonPathOf<Path, T['keyPrototype']>
>

type InternalFlattenedTypesOfStructChildren<
  T extends StructuredTypeDef,
  Path extends string,
> =
  // Breaking this up seems to help the TS compiler cache the results
  // and not grind to a halt
  UnionToIntersection<InternalFlattenedTypesOfStructChildrenUnion<T, Path>>

type InternalFlattenedTypesOfStructChildrenUnion<
  T extends StructuredTypeDef,
  Path extends string,
> = T extends StructuredTypeDef<infer Fields> ? {} extends Fields ? {}
  : {
    readonly [K in keyof Fields]: InternalFlattenedTypesOf<
      Fields[K],
      JsonPathOf<Path, K>
    >
  }[keyof Fields]
  : never

type InternalFlattenedTypesOfUnionChildren<
  T extends UnionTypeDef,
  Path extends string,
> = T extends UnionTypeDef<infer Unions> ? {
    [K in keyof Unions]: InternalFlattenedTypesOfChildren<
      Unions[K],
      Path
    >
  }[keyof Unions]
  : never

type InternalFlattenedTypesOfReadonlyChildren<
  T extends ReadonlyTypeDef,
  Path extends string,
> = InternalFlattenedTypesOfChildren<T['toReadonlyTypeDef'], Path>

type InternalFlattenedTypesOfPartialChildren<
  T extends PartialTypeDef,
  Path extends string,
> = InternalFlattenedTypesOfChildren<T['toPartialTypeDef'], Path>

type InternalFlattenedTypesOfNullableChildren<
  T extends NullableTypeDef,
  Path extends string,
> = InternalFlattenedTypesOfChildren<T['toNullableTypeDef'], Path>

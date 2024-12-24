import {
  type SimplifyDeep,
  type UnionToIntersection,
} from 'type-fest'
import {
  type ListTypeDef,
  type LiteralTypeDef,
  type ObjectTypeDef,
  type RecordTypeDef,
  type TypeDef,
  type UnionTypeDef,
} from './definitions'
import {
  type Depths,
  type StartingDepth,
} from './flattened'
import { type JsonPathOf } from './json_path_of'
import { type StrictType } from './strict_definitions'

export type ValueToTypePathsOf<
  T extends StrictType,
  SegmentOverride extends string = '*',
  Path extends string = '$',
> = SimplifyDeep<InternalFlattenedJsonPathsOf<
  T['definition'],
  SegmentOverride,
  Path,
  Path,
  StartingDepth
>>

type InternalFlattenedJsonPathsOf<
  T extends TypeDef,
  SegmentOverride extends string,
  ValuePath extends string,
  TypePath extends string,
  Depth extends number,
> =
  & {
    readonly [K in ValuePath]: TypePath
  }
  & InternalFlattenedJsonPathsOfChildren<T, SegmentOverride, ValuePath, TypePath, '', Depth>

type InternalFlattenedJsonPathsOfChildren<
  T extends TypeDef,
  SegmentOverride extends string,
  ValuePath extends string,
  TypePath extends string,
  Qualifier extends string,
  Depth extends number,
  NextDepth extends number = Depths[Depth],
> = NextDepth extends -1 ? never
  : T extends LiteralTypeDef ? InternalFlattenedJsonPathsOfLiteralChildren
  : T extends ListTypeDef ? InternalFlattenedJsonPathsOfListChildren<
      T,
      SegmentOverride,
      ValuePath,
      TypePath,
      NextDepth
    >
  : T extends RecordTypeDef ? InternalFlattenedJsonPathsOfRecordChildren<
      T,
      SegmentOverride,
      ValuePath,
      TypePath,
      NextDepth
    >
  : T extends ObjectTypeDef ? InternalFlattenedJsonPathsOfObjectChildren<
      T,
      SegmentOverride,
      ValuePath,
      TypePath,
      Qualifier,
      NextDepth
    >
  : T extends UnionTypeDef ? InternalFlattenedJsonPathsOfUnionChildren<
      T,
      SegmentOverride,
      ValuePath,
      TypePath,
      Qualifier,
      NextDepth
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

type InternalFlattenedJsonPathsOfRecordChildren<
  T extends RecordTypeDef,
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

type InternalFlattenedJsonPathsOfObjectChildren<
  T extends ObjectTypeDef,
  SegmentOverride extends string,
  ValuePath extends string,
  TypePath extends string,
  Qualifier extends string,
  Depth extends number,
> = T extends ObjectTypeDef<infer Fields> ? keyof Fields extends string ? UnionToIntersection<
      {
        readonly [K in keyof Fields]-?: InternalFlattenedJsonPathsOf<
          Exclude<Fields[K], undefined>,
          SegmentOverride,
          JsonPathOf<ValuePath, `${Qualifier}${K}`>,
          JsonPathOf<TypePath, `${Qualifier}${K}`>,
          Depth
        >
      }[keyof Fields]
    >
  : never
  : never

// type InternalFlattenedJsonPathsOfUnionChildren<
//   T extends UnionTypeDef,
//   SegmentOverride extends string,
//   ValuePath extends string,
//   TypePath extends string,
//   Depth extends number,
// > = T extends UnionTypeDef<infer D, infer Unions> ?
//     & ({
//       [K in keyof Unions]: InternalFlattenedJsonPathsOfChildren<
//         Unions[K],
//         SegmentOverride,
//         ValuePath,
//         TypePath,
//         Depth
//       >
//     }[keyof Unions])
//     & (D extends string ? ReadonlyRecord<JsonPathOf<ValuePath, D>, JsonPathOf<TypePath, D>> : {})
//   : never

type InternalFlattenedJsonPathsOfUnionChildren<
  T extends UnionTypeDef,
  SegmentOverride extends string,
  ValuePath extends string,
  TypePath extends string,
  Qualifier extends string,
  Depth extends number,
> = T extends UnionTypeDef<infer D, infer Unions> ? keyof Unions extends string ? D extends null ? UnionToIntersection<{
        readonly [K in keyof Unions]: InternalFlattenedJsonPathsOfChildren<
          Unions[K],
          SegmentOverride,
          ValuePath,
          TypePath,
          '',
          Depth
        >
      }[keyof Unions]>
    : UnionToIntersection<{
      readonly [K in keyof Unions]: InternalFlattenedJsonPathsOfChildren<
        Unions[K],
        SegmentOverride,
        ValuePath,
        TypePath,
        `${Qualifier}${K}:`,
        Depth
      >
    }[keyof Unions]>
  : never
  : never

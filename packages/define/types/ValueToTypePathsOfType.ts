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
} from './Definitions'
import {
  type Depths,
  type StartingDepth,
} from './Flattened'
import { type PathOf } from './PathOf'
import { type StrictType } from './StrictDefinitions'

export type ValueToTypePathsOfType<
  T extends StrictType,
  SegmentOverride extends string = '*',
  Path extends string = '$',
> = SimplifyDeep<InternalFlattenedTypePathsOf<
  T['definition'],
  SegmentOverride,
  Path,
  Path,
  StartingDepth
>>

// TODO rename to FlattenTypePathsOfTypeDef and apply pattern to subsequent types
type InternalFlattenedTypePathsOf<
  T extends TypeDef,
  SegmentOverride extends string,
  ValuePath extends string,
  TypePath extends string,
  Depth extends number,
> =
  & {
    readonly [K in ValuePath]: TypePath
  }
  & InternalFlattenedTypePathsOfChildren<T, SegmentOverride, ValuePath, TypePath, Depth>

type InternalFlattenedTypePathsOfChildren<
  T extends TypeDef,
  SegmentOverride extends string,
  ValuePath extends string,
  TypePath extends string,
  Depth extends number,
  NextDepth extends number = Depths[Depth],
> = NextDepth extends -1 ? never
  : T extends LiteralTypeDef ? InternalFlattenedTypePathsOfLiteralChildren
  : T extends ListTypeDef ? InternalFlattenedTypePathsOfListChildren<
      T,
      SegmentOverride,
      ValuePath,
      TypePath,
      NextDepth
    >
  : T extends RecordTypeDef ? InternalFlattenedTypePathsOfRecordChildren<
      T,
      SegmentOverride,
      ValuePath,
      TypePath,
      NextDepth
    >
  : T extends ObjectTypeDef ? InternalFlattenedTypePathsOfObjectChildren<
      T,
      SegmentOverride,
      ValuePath,
      TypePath,
      NextDepth
    >
  : T extends UnionTypeDef ? InternalFlattenedTypePathsOfUnionChildren<
      T,
      SegmentOverride,
      ValuePath,
      TypePath,
      NextDepth
    >
  : never

type InternalFlattenedTypePathsOfLiteralChildren = {}

type InternalFlattenedTypePathsOfListChildren<
  T extends ListTypeDef,
  SegmentOverride extends string,
  ValuePath extends string,
  TypePath extends string,
  Depth extends number,
> = InternalFlattenedTypePathsOf<
  T['elements'],
  SegmentOverride,
  PathOf<ValuePath, number>,
  PathOf<TypePath, number, SegmentOverride>,
  Depth
>

type InternalFlattenedTypePathsOfRecordChildren<
  T extends RecordTypeDef,
  SegmentOverride extends string,
  ValuePath extends string,
  TypePath extends string,
  Depth extends number,
> = InternalFlattenedTypePathsOf<
  T['valueTypeDef'],
  SegmentOverride,
  PathOf<ValuePath, T['keyPrototype']>,
  PathOf<TypePath, T['keyPrototype'], SegmentOverride>,
  Depth
>

type InternalFlattenedTypePathsOfObjectChildren<
  T extends ObjectTypeDef,
  SegmentOverride extends string,
  ValuePath extends string,
  TypePath extends string,
  Depth extends number,
> = T extends ObjectTypeDef<infer Fields> ? keyof Fields extends string ? UnionToIntersection<
      {
        readonly [K in keyof Fields]-?: InternalFlattenedTypePathsOf<
          Exclude<Fields[K], undefined>,
          SegmentOverride,
          PathOf<ValuePath, K>,
          PathOf<TypePath, K>,
          Depth
        >
      }[keyof Fields]
    >
  : never
  : never

// type InternalFlattenedTypePathsOfUnionChildren<
//   T extends UnionTypeDef,
//   SegmentOverride extends string,
//   ValuePath extends string,
//   TypePath extends string,
//   Depth extends number,
// > = T extends UnionTypeDef<infer D, infer Unions> ?
//     & ({
//       [K in keyof Unions]: InternalFlattenedTypePathsOfChildren<
//         Unions[K],
//         SegmentOverride,
//         ValuePath,
//         TypePath,
//         Depth
//       >
//     }[keyof Unions])
//     & (D extends string ? ReadonlyRecord<JsonPathOf<ValuePath, D>, JsonPathOf<TypePath, D>> : {})
//   : never

type InternalFlattenedTypePathsOfUnionChildren<
  T extends UnionTypeDef,
  SegmentOverride extends string,
  ValuePath extends string,
  TypePath extends string,
  Depth extends number,
> = T extends UnionTypeDef<infer D, infer Unions> ? keyof Unions extends string ? D extends null ? UnionToIntersection<{
        readonly [K in keyof Unions]: InternalFlattenedTypePathsOfChildren<
          Unions[K],
          SegmentOverride,
          ValuePath,
          TypePath,
          Depth
        >
      }[keyof Unions]>
    : UnionToIntersection<{
      readonly [K in keyof Unions]: InternalFlattenedTypePathsOfChildren<
        Unions[K],
        SegmentOverride,
        `${ValuePath}:${K}`,
        `${TypePath}:${K}`,
        Depth
      >
    }[keyof Unions]>
  : never
  : never

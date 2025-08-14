import {
  type UnionToIntersection,
} from 'type-fest'
import {
  type Depths,
  type StartingDepth,
} from './flattened'
import { type PathOf } from './PathOf'
import {
  type Type,
  type TypeDef,
} from './Type'
import {
  type ContextOfValidatingTypeDef,
  type ErrorOfValidatingTypeDef,
  type ValidatingListTypeDef,
  type ValidatingLiteralTypeDef,
  type ValidatingObjectTypeDef,
  type ValidatingRecordTypeDef,
  type ValidatingUnionTypeDef,
} from './ValidatingType'

// TODO rename to FlattenedValidatingTypesOfValidatingType
export type FlattenedTypesOfValidatingType<
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
    : T extends ValidatingLiteralTypeDef ? InternalFlattenedTypeDefsOfLiteralChildren
    : T extends ValidatingListTypeDef ? InternalFlattenedTypeDefsOfListChildren<T, SegmentOverride, Path, NextDepth>
    : T extends ValidatingRecordTypeDef ? InternalFlattenedTypeDefsOfRecordChildren<T, SegmentOverride, Path, NextDepth>
    : T extends ValidatingObjectTypeDef ? InternalFlattenedTypeDefsOfObjectChildren<T, SegmentOverride, Path, NextDepth>
    : T extends ValidatingUnionTypeDef ? InternalFlattenedTypeDefsOfUnionChildren<T, SegmentOverride, Path, NextDepth>
    : never

type InternalFlattenedTypeDefsOfLiteralChildren = {}

type InternalFlattenedTypeDefsOfListChildren<
  T extends ValidatingListTypeDef,
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
  T extends ValidatingRecordTypeDef,
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
  T extends ValidatingObjectTypeDef,
  SegmentOverride extends string | null,
  Path extends string,
  Depth extends number,
> = T extends ValidatingObjectTypeDef<infer _E, infer _C, infer Fields>
  ? keyof Fields extends string ? UnionToIntersection<{
      readonly [
        K in keyof Fields
      ]-?: undefined extends Fields[K]
        // if the field is optional, synthesize a nullable type
        ? InternalFlattenedTypeDefsOf<
          ValidatingUnionTypeDef<
            ErrorOfValidatingTypeDef<Exclude<Fields[K], undefined>>,
            ContextOfValidatingTypeDef<Exclude<Fields[K], undefined>>,
            null,
            {
              readonly '0': Exclude<Fields[K], undefined>,
              readonly '1': ValidatingLiteralTypeDef<undefined>,
            }
          >,
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
  T extends ValidatingUnionTypeDef,
  SegmentOverride extends string | null,
  Path extends string,
  Depth extends number,
> = T extends ValidatingUnionTypeDef<infer _E, infer _C, infer D, infer Unions>
  ? keyof Unions extends string ? D extends null ? UnionToIntersection<{
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

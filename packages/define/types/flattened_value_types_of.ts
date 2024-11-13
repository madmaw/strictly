import { type ReadonlyRecord } from '@de/base'
import { type TypeDefHolder } from './definitions'
import { type FlattenedTypeDefsOf } from './flattened_type_defs_of'
import { type ValueTypeOf } from './value_type_of'

export type FlattenedValueTypesOf<
  T extends TypeDefHolder,
  Flattened extends ReadonlyRecord<string, TypeDefHolder> = FlattenedTypeDefsOf<T, null>,
> = {
  [K in keyof Flattened]: ValueTypeOf<Flattened[K], {}>
}

// TS doesn't like this
// export type FlattenedValueTypesOf2<T extends TypeDef> = InternalFlattenedValueTypesOf<FlattenedTypeDefsOf<T, null>>

// export type InternalFlattenedValueTypesOf<R extends ReadonlyRecord<string, TypeDef>> = {
//   [K in keyof R]: InternalValueTypeOf<R[K], {}>
// }

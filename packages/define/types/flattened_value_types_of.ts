import { type ReadonlyRecord } from '@de/base'
import { type TypeDefHolder } from './definitions'
import { type ValueTypeOf } from './value_type_of'

export type FlattenedValueTypesOf<R extends ReadonlyRecord<string, TypeDefHolder>> = {
  [K in keyof R]: ValueTypeOf<R[K], {}>
}

// TS doesn't like this
// export type FlattenedValueTypesOf2<T extends TypeDef> = InternalFlattenedValueTypesOf<FlattenedTypeDefsOf<T, null>>

// export type InternalFlattenedValueTypesOf<R extends ReadonlyRecord<string, TypeDef>> = {
//   [K in keyof R]: InternalValueTypeOf<R[K], {}>
// }

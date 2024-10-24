import { type ReadonlyRecord } from 'util/record'
import { type TypeDef } from '.'
import { type ValueTypeOf } from './value_type_of'

// TS doesn't like this
// export type FlattenedValueTypesOf<T extends TypeDef> = InternalFlattenValueTypesOf<FlattenedTypeDefsOf<T, null>>

export type FlattenedValueTypesOf<R extends ReadonlyRecord<string, TypeDef>> = {
  [K in keyof R]: ValueTypeOf<R[K]>
}

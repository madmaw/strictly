import { type TypeDefHolder } from './definitions'
import { type FlattenedTypeDefsOf } from './flattened_type_defs_of'
import { type ValueTypeOf } from './value_type_of'

export type FlattenedValueTypesOf<
  T extends TypeDefHolder,
  SegmentOverride extends string | null = null,
  Flattened extends Readonly<Record<string, TypeDefHolder>> = FlattenedTypeDefsOf<T, SegmentOverride>,
> = {
  [K in keyof Flattened]: ValueTypeOf<Flattened[K], {}>
}

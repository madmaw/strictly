import { type Type } from './definitions'
import { type FlattenedTypesOfType } from './flattened_types_of_type'
import { type ValueOfType } from './value_of_type'

export type FlattenedValuesOfType<
  T extends Type,
  SegmentOverride extends string | null = null,
  Flattened extends Readonly<Record<string, Type>> = FlattenedTypesOfType<T, SegmentOverride>,
> = {
  [K in keyof Flattened]: ValueOfType<Flattened[K], {}>
}

import { type FlattenedTypesOfType } from './FlattenedTypesOfType'
import { type Type } from './Type'
import { type ValueOfType } from './ValueOfType'

export type FlattenedValuesOfType<
  T extends Type,
  SegmentOverride extends string | null = null,
  Flattened extends Readonly<Record<string, Type>> = FlattenedTypesOfType<T, SegmentOverride>,
> = {
  [K in keyof Flattened]: ValueOfType<Flattened[K], {}>
}

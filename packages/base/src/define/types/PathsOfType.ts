import { type FlattenedTypesOfType } from './FlattenedTypesOfType'
import { type Type } from './Type'

export type PathsOfType<
  T extends Type,
  SegmentOverride extends string | null = null,
  Prefix extends string = '$',
> = keyof FlattenedTypesOfType<T, SegmentOverride, Prefix>

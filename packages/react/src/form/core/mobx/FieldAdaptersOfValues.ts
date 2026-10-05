import { type ValuePathsOfTypePath } from '@strictly/base'
import { type FieldAdapter } from './FieldAdapter'

export type FieldAdaptersOfValues<
  // oxlint-disable-next-line typescript/no-explicit-any
  FlattenedValues extends Readonly<Record<string, any>>,
  ValuePathsToTypePaths extends Readonly<Record<string, string>>,
  // oxlint-disable-next-line typescript/no-explicit-any
  Context = any,
> = {
  readonly [K in keyof FlattenedValues]: FieldAdapter<
    FlattenedValues[K],
    any, // oxlint-disable-line typescript/no-explicit-any
    any, // oxlint-disable-line typescript/no-explicit-any
    ValuePathsOfTypePath<ValuePathsToTypePaths, K & string>,
    Context
  >
}

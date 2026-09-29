import { type ValuePathsOfTypePath } from '@strictly/define'
import { type FieldAdapter } from './FieldAdapter'

export type FieldAdaptersOfValues<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  FlattenedValues extends Readonly<Record<string, any>>,
  ValuePathsToTypePaths extends Readonly<Record<string, string>>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

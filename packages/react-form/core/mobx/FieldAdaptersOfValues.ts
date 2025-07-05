import { type FieldAdapter } from './FieldAdapter'

export type FieldAdaptersOfValues<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  FlattenedValues extends Readonly<Record<string, any>>,
  TypePathsToValuePaths extends Readonly<Record<keyof FlattenedValues, string>> = Readonly<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Record<keyof FlattenedValues, any>
  >,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Context = any,
> = {
  readonly [
    K in keyof FlattenedValues
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ]: FieldAdapter<FlattenedValues[K], any, any, TypePathsToValuePaths[K], Context>
}

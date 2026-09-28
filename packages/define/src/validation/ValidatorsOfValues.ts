import { type Validator } from 'validation/validator'

export type ValidatorsOfValues<
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
  ]: Validator<FlattenedValues[K], any, TypePathsToValuePaths[K], Context>
}

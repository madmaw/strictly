import { type Validator } from 'define/validation/validator'

export type ValidatorsOfValues<
  // oxlint-disable-next-line typescript/no-explicit-any
  FlattenedValues extends Readonly<Record<string, any>>,
  TypePathsToValuePaths extends Readonly<
    Record<keyof FlattenedValues, string>
  > = Readonly<
    // oxlint-disable-next-line typescript/no-explicit-any
    Record<keyof FlattenedValues, any>
  >,
  // oxlint-disable-next-line typescript/no-explicit-any
  Context = any,
> = {
  readonly [
    K in keyof FlattenedValues // oxlint-disable-next-line typescript/no-explicit-any
  ]: Validator<FlattenedValues[K], any, TypePathsToValuePaths[K], Context>
}

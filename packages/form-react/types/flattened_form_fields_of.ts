import { type ValueOf } from 'type-fest'

export type FlattenedFormFieldsOf<
  E,
  JsonPaths extends Record<string, string>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TypePathsToFieldTypes extends Partial<Readonly<Record<ValueOf<JsonPaths>, any>>>,
> = {
  readonly [K in keyof JsonPaths as unknown extends TypePathsToFieldTypes[JsonPaths[K]] ? never : K]: {
    value: TypePathsToFieldTypes[JsonPaths[K]],
    error?: E,
    disabled: boolean,
  }
}

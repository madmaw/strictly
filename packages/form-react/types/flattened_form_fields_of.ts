import { type ValueOf } from 'type-fest'
import { type FormField } from './form_field'

/**
 * Maps type paths to value paths for
 */
export type FlattenedFormFieldsOf<
  JsonPaths extends Record<string, string>,
  TypePathsToFormFields extends Partial<Readonly<Record<ValueOf<JsonPaths>, FormField>>>,
> = keyof TypePathsToFormFields extends ValueOf<JsonPaths> ? {
    readonly [K in keyof JsonPaths as unknown extends TypePathsToFormFields[JsonPaths[K]] ? never : K]:
      TypePathsToFormFields[JsonPaths[K]]
  }
  // TODO is there a better way of enforcing the types are a subset?
  : never

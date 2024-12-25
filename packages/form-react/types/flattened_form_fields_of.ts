import { type PrintableOf } from '@de/base'
import { type ValueOf } from 'type-fest'
import { type Field } from './field'

/**
 * Maps type paths to value paths for
 */
export type FlattenedFormFieldsOf<
  JsonPaths extends Record<string, string>,
  TypePathsToFormFields extends Partial<Readonly<Record<ValueOf<JsonPaths>, Field>>>,
> = keyof TypePathsToFormFields extends ValueOf<JsonPaths> ? {
    readonly [K in keyof JsonPaths as unknown extends TypePathsToFormFields[JsonPaths[K]] ? never : K]:
      TypePathsToFormFields[JsonPaths[K]]
  }
  // TODO is there a better way of enforcing the types are a subset?
  : `fields missing paths: ${PrintableOf<Exclude<keyof TypePathsToFormFields, ValueOf<JsonPaths>>>}`

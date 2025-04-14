// TODO rename/split-out this file
import { type ToOfFieldAdapter } from './field_adapter'
import {
  type FlattenedConvertedFieldsOf,
  type FormModel,
} from './form_model'

/**
 * Used to extract the supported value paths from a presenter
 */
export type ValuePathsOfModel<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Model extends FormModel<any, any, any, any, any>,
> = Model extends FormModel<
  infer _1,
  infer _2,
  infer _3,
  infer _4,
  infer ValuePathsToAdapters
> ? keyof ValuePathsToAdapters
  : never

/**
 * Used to extract the render type (so the value that is passed to the view) of a given value path
 * from a presenter
 */
export type ToValueOfModelValuePath<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Model extends FormModel<any, any, any, any, any>,
  K extends ValuePathsOfModel<Model>,
> = Model extends FormModel<
  infer _1,
  infer _2,
  infer _3,
  infer _4,
  infer ValuePathsToAdapters
> ? ToOfFieldAdapter<ValuePathsToAdapters[K]>
  : never

/**
 * Extracts the form fields from the presenter. The recommended way is to
 * define the form fields explicitly and use that type to enforce the types
 * of your converters, but generating the FormFields from your presenter
 * is less typing, albeit at the cost of potentially getting type errors
 * reported a long way away from the source
 */
export type FormFieldsOfModel<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Model extends FormModel<any, any, any, any, any>,
> = Model extends FormModel<
  infer _1,
  infer _2,
  infer _3,
  infer _4,
  infer ValuePathsToAdapters
> ? FlattenedConvertedFieldsOf<ValuePathsToAdapters>
  : never

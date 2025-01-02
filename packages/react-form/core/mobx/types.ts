// TODO rename/split-out this file
import { type ToTypeOfFieldAdapter } from './field_adapter'
import {
  type FlattenedConvertedFieldsOf,
  type FormPresenter,
} from './form_presenter'

/**
 * Used to extract the supported value paths from a presenter
 */
export type ValuePathsOfPresenter<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Presenter extends FormPresenter<any, any, any, any>,
> = Presenter extends FormPresenter<
  infer _1,
  infer _2,
  infer _3,
  infer ValuePathsToAdapters
> ? keyof ValuePathsToAdapters
  : never

/**
 * Used to extract the render type (so the value that is passed to the view) of a given value path
 * from a presenter
 */
export type ToValueOfPresenterValuePath<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Presenter extends FormPresenter<any, any, any, any>,
  K extends ValuePathsOfPresenter<Presenter>,
> = Presenter extends FormPresenter<
  infer _1,
  infer _2,
  infer _3,
  infer ValuePathsToAdapters
> ? ToTypeOfFieldAdapter<ValuePathsToAdapters[K]>
  : never

/**
 * Extracts the form fields from the presenter. The recommended way is to
 * define the form fields explicitly and use that type to enforce the types
 * of your converters, but generating the FormFields from your presenter
 * is less typing, albeit at the cost of potentially getting type errors
 * reported a long way away from the source
 */
export type FormFieldsOfPresenter<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Presenter extends FormPresenter<any, any, any, any>,
> = Presenter extends FormPresenter<
  infer _1,
  infer _2,
  infer _3,
  infer ValuePathsToAdapters
> ? FlattenedConvertedFieldsOf<ValuePathsToAdapters>
  : never

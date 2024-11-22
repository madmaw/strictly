import { type SimplifyDeep } from 'type-fest'
import {
  type FlattenedConvertedFieldsOf,
  type FormPresenter,
} from './form_presenter'

export type PathsOfPresenterFields<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Presenter extends FormPresenter<any, any, any, any>,
> = Presenter extends FormPresenter<
  infer _1,
  infer _2,
  infer _3,
  infer ValuePathsToConverters
> ? keyof SimplifyDeep<ValuePathsToConverters>
  : never

export type ValueTypeOfPresenterField<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Presenter extends FormPresenter<any, any, any, any>,
  K extends PathsOfPresenterFields<Presenter>,
> = Presenter extends FormPresenter<
  infer _1,
  infer _2,
  infer _3,
  infer ValuePathsToConverters
> ? ReturnType<ValuePathsToConverters[K]['revert']>
  : never

export type FormFieldsOfPresenter<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Presenter extends FormPresenter<any, any, any, any>,
> = Presenter extends FormPresenter<
  infer _1,
  infer _2,
  infer _3,
  infer ValuePathsToConverters
> ? SimplifyDeep<FlattenedConvertedFieldsOf<ValuePathsToConverters>>
  : never

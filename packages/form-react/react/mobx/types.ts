import { type SimplifyDeep } from 'type-fest'
import { type FormPresenter } from './form_presenter'

export type PathsOfPresenterFields<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Presenter extends FormPresenter<any, any, any, any>,
> = Presenter extends FormPresenter<
  infer _1,
  infer _2,
  infer _3,
  infer _4,
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
  infer _4,
  infer ValuePathsToConverters
> ? ReturnType<ValuePathsToConverters[K]['revert']>
  : never

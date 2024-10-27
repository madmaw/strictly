export const MOBX_OBSERVABLE_KEY = '___mobx_observable'

export type MobxObservable<T = {}> = {
  [MOBX_OBSERVABLE_KEY]: true,
} & T

export type NonMobxObservable<T = {}> = {
  [MOBX_OBSERVABLE_KEY]?: never,
} & T

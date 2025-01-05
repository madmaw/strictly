import {
  type Type,
} from './definitions'
import { type ValueOfType } from './value_of_type'

const MOBX_OBSERVABLE_KEY = '___mobx_observable'

export type MobxObservable<T = {}> = {
  [MOBX_OBSERVABLE_KEY]: true,
} & T

export type NonMobxObservable<T = {}> = {
  [MOBX_OBSERVABLE_KEY]?: never,
} & T

export type MobxValueOfType<T extends Type> = ValueOfType<T, MobxObservable>

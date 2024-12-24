import {
  type Type,
} from './definitions'
import { type ValueTypeOf } from './value_type_of'

const MOBX_OBSERVABLE_KEY = '___mobx_observable'

export type MobxObservable<T = {}> = {
  [MOBX_OBSERVABLE_KEY]: true,
} & T

export type NonMobxObservable<T = {}> = {
  [MOBX_OBSERVABLE_KEY]?: never,
} & T

export type MobxValueTypeOf<T extends Type> = ValueTypeOf<T, MobxObservable>

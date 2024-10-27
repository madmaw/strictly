import {
  type InternalValueTypeOf,
  type TypeDef,
} from '@de/fine'
import { type ReadonlyRecord } from '@de/fine/util/record'
import { type FlattenedFormValuesOf } from './flattened_form_fields_of'

type Validator<
  R extends ReadonlyRecord<string, TypeDef>,
  K extends keyof R,
  E,
> = (
  value: InternalValueTypeOf<R[K]>,
  key: K,
  values: FlattenedFormValuesOf<R>,
) => E | null

export type FlattenedFormValidatorsOf<R extends ReadonlyRecord<string, TypeDef>, E> = {
  [K in keyof R]: Validator<R, K, E>
}

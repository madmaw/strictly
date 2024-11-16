import { type ReadonlyRecord } from '@de/base'
import {
  type FlattenedTypeDefsOf,
  type TypeDefHolder,
  type ValueTypeOf,
} from '@de/fine'

export type FlattenedFormFieldsOf<
  T extends TypeDefHolder,
  E,
  R extends ReadonlyRecord<string, TypeDefHolder> = FlattenedTypeDefsOf<T, null>,
> = {
  [K in keyof R]: {
    value: ValueTypeOf<R[K]>,
    error?: E,
    disabled: boolean,
  }
}

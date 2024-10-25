import {
  type FlattenedTypeDefsOf,
  type ValueTypeOf,
} from '@tscriptors/core'
import {
  boolean,
  literal,
  string,
  struct,
} from '@tscriptors/core/types/defs/builders'
import { type FlattenedFormFieldsOf } from '@tscriptors/form'

type Title = 'mr' | 'ms' | 'mx' | 'mrs' | 'dr'

const title = literal<Title>()

const { holder } = struct()
  .set('firstName', string)
  .set('lastName', string)
  .setOptional('middleName', string)
  .set('title', title)
  .set('noMiddleName', boolean)

export type PersonDetails = ValueTypeOf<typeof holder>
type FlattenedPersonDetailsTypeDefs = FlattenedTypeDefsOf<typeof holder, '@'>
export type PersonDetailsFields = FlattenedFormFieldsOf<FlattenedPersonDetailsTypeDefs, string>

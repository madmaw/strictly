import {
  type FlattenedTypeDefsOf,
  type ValueTypeOf,
} from '@de/fine'
import {
  boolean,
  literal,
  string,
  struct,
} from '@de/fine/types/defs/builders'
import { type FlattenedFormFieldsOf } from '@de/form-react'

type Title = 'mr' | 'ms' | 'mx' | 'mrs' | 'dr'

const title = literal<Title>()

const { narrow } = struct()
  .set('firstName', string)
  .set('lastName', string)
  .setOptional('middleName', string)
  .set('title', title)
  .set('noMiddleName', boolean)

export type PersonDetails = ValueTypeOf<typeof narrow>
type FlattenedPersonDetailsTypeDefs = FlattenedTypeDefsOf<typeof narrow, '*'>
export type PersonDetailsFields = FlattenedFormFieldsOf<FlattenedPersonDetailsTypeDefs, string>

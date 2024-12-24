import {
  number,
  record,
} from 'types/builders'
import { type FlattenedValueTypesOf } from 'types/flattened_value_types_of'

describe('FlattenedValueTypesOf', function () {
  // note we only test a small example since most of the work is done in flatten
  describe('record', function () {
    const builder = record<typeof number, string>(number)
    type V = FlattenedValueTypesOf<typeof builder>

    let v: {
      readonly $: Record<string, number>,
      readonly [_: `$.${string}`]: number,
    }
    it('equals expected type', function () {
      expectTypeOf(v).toEqualTypeOf<V>()
    })
  })
})

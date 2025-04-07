import {
  numberType,
  record,
} from 'types/builders'
import { type FlattenedAccessorsOfType } from 'types/flattened_accessors_of_type'

describe('FlattenedAccessorsOfType', function () {
  // note we only test a small example since most of the work is done in flatten
  describe('record', function () {
    const builder = record<typeof numberType, string>(numberType)
    type V = FlattenedAccessorsOfType<typeof builder>

    type C = {
      readonly $: {
        readonly value: Record<string, number>,
        set: (v: Record<string, number>) => void,
      },
      readonly [_: `$.${string}`]: {
        readonly value: number,
        set: (v: number) => void,
      },
    }
    it('equals expected type', function () {
      expectTypeOf<C>().toEqualTypeOf<V>()
    })
  })
})

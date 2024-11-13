import {
  map,
  number,
} from 'types/builders'
import { type FlattenedAccessorsOf } from 'types/flattened_accessors_of'

describe('FlattenedAccessorsOf', function () {
  // note we only test a small example since most of the work is done in flatten
  describe('map', function () {
    const builder = map<string, typeof number>(number)
    type V = FlattenedAccessorsOf<typeof builder>

    let v: {
      readonly $: {
        value: Record<string, number>,
        set: (v: Record<string, number>) => void,
      },
      readonly [_: `$.${string}`]: {
        value: number,
        set: (v: number) => void,
      },
    }
    it('equals expected type', function () {
      expectTypeOf(v).toEqualTypeOf<V>()
    })
  })
})

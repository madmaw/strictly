import {
  map,
  number,
} from 'types/builders'
import { type FlattenedTypeDefsOf } from 'types/flattened_type_defs_of'
import { type FlattenedValueTypesOf } from 'types/flattened_value_types_of'

describe('FlattenedValueTypesOf', function () {
  describe('map', function () {
    const builder = map<string, typeof number>(number)
    type T = FlattenedTypeDefsOf<typeof builder, null>
    type V = FlattenedValueTypesOf<T>

    let v: {
      readonly $: Record<string, number>,
      readonly [_: `$.${string}`]: number,
    }
    it('equals expected type', function () {
      expectTypeOf(v).toEqualTypeOf<V>()
    })
  })
})

import {
  map,
  number,
} from 'types/defs/builders'
import { type FlattenedTypeDefsOf } from 'types/defs/flattened_type_defs_of'
import { type FlattenedValueTypesOf } from 'types/defs/flattened_value_types_of'

describe('FlattenedValueTypesOf', function () {
  describe('map', function () {
    const { typeDef } = map<string, typeof number.typeDef>(number)
    type T = FlattenedTypeDefsOf<typeof typeDef, null>
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

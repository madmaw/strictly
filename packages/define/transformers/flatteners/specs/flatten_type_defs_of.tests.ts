import { flattenTypeDefsOf } from 'transformers/flatteners/flatten_type_defs_of'
import {
  boolean,
  list,
  number,
  struct,
} from 'types/builders'

describe('flattenTypeDefsOf', function () {
  it('flattens', function () {
    const listTypeDef = list(number)
    const structTypeDef = struct()
      .set('a', listTypeDef)
      .set('b', boolean)
    const flattened = flattenTypeDefsOf(
      structTypeDef,
    )

    expect(flattened).toEqual({
      $: structTypeDef.narrow,
      '$.a': listTypeDef.narrow,
      '$.a.*': number.narrow,
      '$.b': boolean.narrow,
    })
  })
})

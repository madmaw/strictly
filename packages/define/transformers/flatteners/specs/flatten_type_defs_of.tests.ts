import { flattenTypeDefsOf } from 'transformers/flatteners/flatten_type_defs_of'
import {
  booleanType,
  list,
  numberType,
  object,
} from 'types/builders'

describe('flattenTypeDefsOf', function () {
  it('flattens', function () {
    const listTypeDef = list(numberType)
    const structTypeDef = object()
      .set('a', listTypeDef)
      .set('b', booleanType)
    const flattened = flattenTypeDefsOf(
      structTypeDef,
    )

    expect(flattened).toEqual({
      $: structTypeDef.narrow,
      '$.a': listTypeDef.narrow,
      '$.a.*': numberType.narrow,
      '$.b': booleanType.narrow,
    })
  })
})

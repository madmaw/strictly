import { flattenTypesOfType } from 'transformers/flatteners/flatten_types_of_type'
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
    const flattened = flattenTypesOfType(
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

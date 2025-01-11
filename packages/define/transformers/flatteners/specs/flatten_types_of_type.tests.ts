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
      .field('a', listTypeDef)
      .field('b', booleanType)
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

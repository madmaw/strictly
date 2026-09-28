import { flattenTypesOfType } from 'transformers/flatteners/flattenTypesOfType'
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
      ._type
    const flattened = flattenTypesOfType(
      structTypeDef,
    )

    expect(flattened).toEqual({
      $: structTypeDef,
      '$.a': listTypeDef._type,
      '$.a.*': numberType._type,
      '$.b': booleanType._type,
    })
  })
})

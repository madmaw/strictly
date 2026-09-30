import { flattenTypesOfType } from 'define/transformers/flatteners/flattenTypesOfType'
import { booleanType, list, numberType, object } from 'define/types/builders'

describe('flattenTypesOfType', () => {
  it('flattens', () => {
    const elementType = numberType.narrow
    const listType = list(elementType).narrow
    const bType = booleanType.narrow
    const structType = object().field('a', listType).field('b', bType).narrow
    const flattened = flattenTypesOfType(structType)

    expect(flattened).toEqual({
      $: structType,
      '$.a': listType,
      '$.a.*': elementType,
      '$.b': bType,
    })
  })
})

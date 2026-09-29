import { flattenTypesOfType } from 'transformers/flatteners/flattenTypesOfType'
import { booleanType, list, numberType, object } from 'types/builders'

describe('flattenTypesOfType', () => {
  it('flattens', () => {
    const elementType = numberType.narrow
    const listType = list(elementType).narrow
    const bType = booleanType.narrow
    const structType = object().field('a', listType).field('b', bType).narrow
    const flattened = flattenTypesOfType(structType)

    expect(Object.keys(flattened).sort()).toEqual(['$', '$.a', '$.a.*', '$.b'])
    expect(flattened.$).toBe(structType)
    expect(flattened['$.a']).toBe(listType)
    expect(flattened['$.a.*']).toBe(elementType)
    expect(flattened['$.b']).toBe(bType)
  })
})

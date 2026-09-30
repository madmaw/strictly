import { petType, rex } from 'define/specs/fixtures/pet'
import { flattenValuesOfType } from 'define/transformers/flatteners/flattenValuesOfType'
import {
  booleanType,
  list,
  numberType,
  object,
  stringType,
  union,
} from 'define/types/builders'

describe('flattenValuesOfType', () => {
  // note that we already have tests for the type and the function that this calls, so
  // this is only a sanity check
  it('flattens', () => {
    const flattened = flattenValuesOfType(
      object().field('a', list(numberType)).field('b', booleanType).narrow,
      {
        a: [1, 2, 4],
        b: false,
      },
    )
    expect(flattened).toEqual({
      $: {
        a: [1, 2, 4],
        b: false,
      },
      '$.a': [1, 2, 4],
      '$.a.0': 1,
      '$.a.1': 2,
      '$.a.2': 4,
      '$.b': false,
    })
  })

  it('flattens nullable, optional and discriminated values', () => {
    expect(flattenValuesOfType(petType, rex)).toEqual({
      $: rex,
      '$.name': 'Rex',
      '$.alive': true,
      '$.tags': ['a'],
      '$.tags.0': 'a',
      '$.owner': rex.owner,
      '$.owner.firstName': 'Bob',
      '$.owner.email': '',
      '$.species': rex.species,
      '$.species:dog.barks': 1,
      '$.species:dog.breed': undefined,
      '$.species:dog.type': 'dog',
    })
  })

  it('has no children for a null value', () => {
    const flattened = flattenValuesOfType(petType, {
      ...rex,
      owner: null,
    })
    expect(flattened['$.owner']).toBeNull()
    expect('$.owner.firstName' in flattened).toBe(false)
  })

  it('qualifies nested discriminated unions with every discriminator', () => {
    const inner = union('y')
      .or('p', object().field('a', booleanType))
      .or('q', object().field('b', numberType)).narrow
    const type = union('x')
      .or('1', inner)
      .or('2', object().field('c', stringType)).narrow
    const value = { x: '1', y: 'p', a: true } as const
    expect(flattenValuesOfType(type, value)).toEqual({
      $: value,
      '$:1:p.a': true,
      '$:1:p.x': '1',
      '$:1:p.y': 'p',
    })
  })
})

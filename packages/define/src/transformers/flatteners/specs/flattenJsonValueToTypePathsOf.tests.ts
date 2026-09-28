import { flattenJsonValueToTypePathsOf } from 'transformers/flatteners/flattenJsonValueToTypePathsOf'
import {
  booleanType,
  list,
  nullType,
  numberType,
  object,
  record,
  stringType,
  union,
} from 'types/builders'

describe('flattenJsonValueToTypePathsOf', () => {
  describe('literal', () => {
    const typeDef = numberType
    const flattened = flattenJsonValueToTypePathsOf(typeDef, 1)

    it('equals expected value', () => {
      expect(flattened).toEqual({
        $: '$',
      })
    })
  })

  describe('list', () => {
    const typeDef = list(numberType)
    const flattened = flattenJsonValueToTypePathsOf(typeDef, [1, 2])

    it('equals expected value', () => {
      expect(flattened).toEqual({
        $: '$',
        '$.0': '$.*',
        '$.1': '$.*',
      })
    })
  })

  describe('record', () => {
    const typeDef = record<typeof numberType, 'a' | 'b'>(numberType)
    const flattened = flattenJsonValueToTypePathsOf(typeDef, {
      a: 1,
      b: 3,
    })

    it('equals expected value', () => {
      expect(flattened).toEqual({
        $: '$',
        '$.a': '$.*',
        '$.b': '$.*',
      })
    })
  })

  describe('object', () => {
    const typeDef = object().field('a', numberType).field('b', booleanType)
    const flattened = flattenJsonValueToTypePathsOf(typeDef, {
      a: 1,
      b: true,
    })

    it('equals expected value', () => {
      expect(flattened).toEqual({
        $: '$',
        '$.a': '$.a',
        '$.b': '$.b',
      })
    })
  })

  describe('union', () => {
    describe('non-discriminated', () => {
      const typeDef = union().or('a', list(numberType)).or('b', nullType)
      const flattened = flattenJsonValueToTypePathsOf(typeDef, [1, 2, 3])

      it('equals expected value', () => {
        expect(flattened).toEqual({
          $: '$',
          '$.0': '$.*',
          '$.1': '$.*',
          '$.2': '$.*',
        })
      })
    })

    describe('discriminated', () => {
      const typeDef = union('d')
        .or('x', object().field('a', numberType).field('b', booleanType))
        .or('y', object().field('c', stringType).field('d', booleanType))
      const flattened = flattenJsonValueToTypePathsOf(typeDef, {
        d: 'x',
        a: 1,
        b: true,
      })

      it('equals expected value', () => {
        expect(flattened).toEqual({
          $: '$',
          '$:x.a': '$:x.a',
          '$:x.b': '$:x.b',
          '$:x.d': '$:x.d',
        })
      })
    })
  })
})

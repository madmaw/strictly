import { flattenJsonValueToTypePathsOf } from 'define/transformers/flatteners/flattenJsonValueToTypePathsOf'
import {
  booleanType,
  list,
  nullType,
  numberType,
  object,
  record,
  stringType,
  union,
} from 'define/types/builders'

describe('flattenJsonValueToTypePathsOf', () => {
  describe('literal', () => {
    const type = numberType.narrow
    const flattened = flattenJsonValueToTypePathsOf(type, 1)

    it('equals expected value', () => {
      expect(flattened).toEqual({
        $: '$',
      })
    })
  })

  describe('list', () => {
    const type = list(numberType).narrow
    const flattened = flattenJsonValueToTypePathsOf(type, [1, 2])

    it('equals expected value', () => {
      expect(flattened).toEqual({
        $: '$',
        '$.0': '$.*',
        '$.1': '$.*',
      })
    })
  })

  describe('record', () => {
    const type = record<typeof numberType, 'a' | 'b'>(numberType).narrow
    const flattened = flattenJsonValueToTypePathsOf(type, {
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
    const type = object().field('a', numberType).field('b', booleanType).narrow
    const flattened = flattenJsonValueToTypePathsOf(type, {
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
      const type = union().or('a', list(numberType)).or('b', nullType).narrow
      const flattened = flattenJsonValueToTypePathsOf(type, [1, 2, 3])

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
      const type = union('d')
        .or('x', object().field('a', numberType).field('b', booleanType))
        .or('y', object().field('c', stringType).field('d', booleanType)).narrow
      const flattened = flattenJsonValueToTypePathsOf(type, {
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

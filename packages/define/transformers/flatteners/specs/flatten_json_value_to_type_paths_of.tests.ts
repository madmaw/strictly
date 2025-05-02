import { flattenJsonValueToTypePathsOf } from 'transformers/flatteners/flatten_json_value_to_type_paths_of'
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

describe('flattenJsonValueToTypePathsOf', function () {
  describe('literal', function () {
    const typeDef = numberType
    const flattened = flattenJsonValueToTypePathsOf(typeDef, 1)

    it('equals expected value', function () {
      expect(flattened).toEqual({
        $: '$',
      })
    })
  })

  describe('list', function () {
    const typeDef = list(numberType)
    const flattened = flattenJsonValueToTypePathsOf(typeDef, [
      1,
      2,
    ])

    it('equals expected value', function () {
      expect(flattened).toEqual({
        $: '$',
        '$.0': '$.*',
        '$.1': '$.*',
      })
    })
  })

  describe('record', function () {
    const typeDef = record<typeof numberType, 'a' | 'b'>(numberType)
    const flattened = flattenJsonValueToTypePathsOf(typeDef, {
      a: 1,
      b: 3,
    })

    it('equals expected value', function () {
      expect(flattened).toEqual({
        $: '$',
        '$.a': '$.*',
        '$.b': '$.*',
      })
    })
  })

  describe('object', function () {
    const typeDef = object()
      .field('a', numberType)
      .field('b', booleanType)
    const flattened = flattenJsonValueToTypePathsOf(typeDef, {
      a: 1,
      b: true,
    })

    it('equals expected value', function () {
      expect(flattened).toEqual({
        $: '$',
        '$.a': '$.a',
        '$.b': '$.b',
      })
    })
  })

  describe('union', function () {
    describe('non-discriminated', function () {
      const typeDef = union()
        .or('a', list(numberType))
        .or('b', nullType)
      const flattened = flattenJsonValueToTypePathsOf(typeDef, [
        1,
        2,
        3,
      ])

      it('equals expected value', function () {
        expect(flattened).toEqual({
          $: '$',
          '$.0': '$.*',
          '$.1': '$.*',
          '$.2': '$.*',
        })
      })
    })

    describe('discriminated', function () {
      const typeDef = union('d')
        .or('x', object().field('a', numberType).field('b', booleanType))
        .or('y', object().field('c', stringType).field('d', booleanType))
      const flattened = flattenJsonValueToTypePathsOf(typeDef, {
        d: 'x',
        a: 1,
        b: true,
      })

      it('equals expected value', function () {
        expect(flattened).toEqual({
          $: '$',
          '$:x.a': '$:x.a',
          '$:x.b': '$:x.b',
        })
      })
    })
  })
})

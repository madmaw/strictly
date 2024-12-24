import { flattenJsonValueToTypePathsOf } from 'transformers/flatteners/flatten_json_value_to_type_paths_of'
import {
  boolean,
  list,
  nullTypeDefHolder,
  number,
  object,
  record,
  string,
  union,
} from 'types/builders'

describe('flattenJsonValueToTypePathsOf', function () {
  describe('literal', function () {
    const typeDef = number
    const flattened = flattenJsonValueToTypePathsOf(typeDef, 1)

    it('equals expected value', function () {
      expect(flattened).toEqual({
        $: '$',
      })
    })
  })

  describe('list', function () {
    const typeDef = list(number)
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
    const typeDef = record<typeof number, 'a' | 'b'>(number)
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
      .set('a', number)
      .set('b', boolean)
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
        .add('a', list(number))
        .add('b', nullTypeDefHolder)
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
        .add('x', object().set('a', number).set('b', boolean))
        .add('y', object().set('c', string).set('d', boolean))
      const flattened = flattenJsonValueToTypePathsOf(typeDef, {
        d: 'x',
        a: 1,
        b: true,
      })

      it('equals expected value', function () {
        expect(flattened).toEqual({
          $: '$',
          '$.x:a': '$.x:a',
          '$.x:b': '$.x:b',
        })
      })
    })
  })
})

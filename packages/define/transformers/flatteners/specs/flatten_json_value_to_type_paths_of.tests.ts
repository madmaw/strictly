import { flattenJsonValueToTypePathsOf } from 'transformers/flatteners/flatten_json_value_to_type_paths_of'
import {
  boolean,
  list,
  map,
  nullTypeDefHolder,
  number,
  struct,
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
        '$[0]': '$.*',
        '$[1]': '$.*',
      })
    })
  })

  describe('map', function () {
    const typeDef = map<'a' | 'b', typeof number>(number)
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

  describe('struct', function () {
    const typeDef = struct()
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
        '$[0]': '$.*',
        '$[1]': '$.*',
        '$[2]': '$.*',
      })
    })
  })
})

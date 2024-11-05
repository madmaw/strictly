import {
  type AnyValueType,
  flattenValue,
} from 'transformers/flatteners/flatten_value'
import {
  boolean,
  list,
  literal,
  map,
  nullTypeDefHolder,
  number,
  struct,
  union,
} from 'types/builders'

describe('FlattenValue', function () {
  function toString(v: AnyValueType) {
    return JSON.stringify(v)
  }

  describe('literal', function () {
    it('equals expected type', function () {
      const flattened = flattenValue(number, 1, toString)
      expect(flattened).toEqual({
        $: '1',
      })
    })
  })

  describe('list', function () {
    it('equals expected type', function () {
      const flattened = flattenValue(
        list(number),
        [
          1,
          2,
          3,
        ],
        toString,
      )
      expect(flattened).toEqual({
        $: '[1,2,3]',
        ['$[0]']: '1',
        ['$[1]']: '2',
        ['$[2]']: '3',
      })
    })
  })

  describe('map', function () {
    it('equals expected type', function () {
      const flattened = flattenValue(
        map<'a' | 'b', typeof number>(number),
        {
          a: 1,
          b: 3,
        },
        toString,
      )
      expect(flattened).toEqual({
        $: '{"a":1,"b":3}',
        ['$.a']: '1',
        ['$.b']: '3',
      })
    })
  })

  describe('struct', function () {
    it('equals expected type', function () {
      const flattened = flattenValue(
        struct().set('a', number).set('b', boolean),
        {
          a: 1,
          b: false,
        },
        toString,
      )
      expect(flattened).toEqual({
        $: '{"a":1,"b":false}',
        ['$.a']: '1',
        ['$.b']: 'false',
      })
    })
  })

  describe('union', function () {
    describe('discriminated', function () {
      it('equals expected type', function () {
        const typeDefHolder = union('d')
          .add('1', struct().set('a', number))
          .add('2', struct().set('b', boolean))
        const flattened = flattenValue(
          typeDefHolder,
          {
            d: '1',
            a: 2,
          },
          toString,
        )
        expect(flattened).toEqual({
          $: '{"d":"1","a":2}',
          ['$.d']: '"1"',
          ['$.a']: '2',
        })
      })
    })
    describe('non-discriminated', function () {
      it('equals expected type', function () {
        const flattened = flattenValue(
          union()
            .add('0', number)
            .add('1', nullTypeDefHolder),
          null,
          toString,
        )
        expect(flattened).toEqual({
          $: 'null',
        })
      })
    })

    describe('complex non-discriminated', function () {
      it('equals expected type', function () {
        const flattened = flattenValue(
          union()
            .add('z', list(number))
            .add('x', nullTypeDefHolder)
            .add('y', literal([false])),
          [
            1,
            2,
            3,
          ],
          toString,
        )
        expect(flattened).toEqual({
          $: '[1,2,3]',
          ['$[0]']: '1',
          ['$[1]']: '2',
          ['$[2]']: '3',
        })
      })
    })
  })
})

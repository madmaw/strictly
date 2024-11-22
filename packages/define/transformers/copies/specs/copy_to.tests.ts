import {
  type AnyValueType,
  copyTo,
} from 'transformers/copies/copy_to'
import {
  boolean,
  list,
  literal,
  map,
  number,
  string,
  struct,
  union,
} from 'types/builders'
import { TypeDefType } from 'types/definitions'
import { type StrictTypeDef } from 'types/strict_definitions'

describe('copyTo', function () {
  function toString(v: AnyValueType, t: StrictTypeDef) {
    if (t.type === TypeDefType.Literal) {
      return JSON.stringify(v)
    } else {
      return v
    }
  }

  describe('literal', function () {
    const typeDef = literal<1>()
    it('copies', function () {
      const c = copyTo(typeDef, 1, toString)
      expect(c).toEqual('1')
    })
  })

  describe('list', function () {
    const typeDef = list(literal<number>())
    it('copies', function () {
      const c = copyTo(
        typeDef,
        [
          1,
          2,
          3,
        ],
        toString,
      )
      expect(c).toEqual([
        '1',
        '2',
        '3',
      ])
    })
  })

  describe('map', function () {
    const typeDef = map<typeof number, 'a' | 'b'>(number)
    it('copies', function () {
      const c = copyTo(
        typeDef,
        {
          a: 1,
          b: 2,
        },
        toString,
      )
      expect(c).toEqual({
        a: '1',
        b: '2',
      })
    })
  })

  describe('struct', function () {
    const typeDef = struct()
      .set('a', number)
      .set('b', boolean)
      .set('c', string)
    it('copies', function () {
      const c = copyTo(
        typeDef,
        {
          a: 1,
          b: true,
          c: 'a',
        },
        toString,
      )
      expect(c).toEqual({
        a: '1',
        b: 'true',
        c: '"a"',
      })
    })
  })

  describe('union', function () {
    describe('non-discriminated', function () {
      const typeDef = union()
        .add('0', list(number))
        .add('1', literal(['b']))
        .add('2', literal([false]))
      it('copies string literal', function () {
        const c = copyTo(
          typeDef,
          'b',
          toString,
        )
        expect(c).toEqual('"b"')
      })

      it('copies boolean literal', function () {
        const c = copyTo(
          typeDef,
          false,
          toString,
        )
        expect(c).toEqual('false')
      })
    })
  })
})

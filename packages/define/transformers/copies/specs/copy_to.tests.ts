import {
  type AnyValueType,
  copyTo,
} from 'transformers/copies/copy_to'
import {
  booleanType,
  list,
  literal,
  numberType,
  object,
  record,
  stringType,
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
    const type = literal<1>()
    it('copies', function () {
      const c = copyTo(type, 1, toString)
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

  describe('record', function () {
    const typeDef = record<typeof numberType, 'a' | 'b'>(numberType)
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

  describe('object', function () {
    const typeDef = object()
      .field('a', numberType)
      .field('b', booleanType)
      .field('c', stringType)
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
        .or('0', list(numberType))
        .or('1', literal(['b']))
        .or('2', literal([false]))
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

    describe('discriminated', function () {
      const typeDef = union('d')
        .or('a', object().field('x', numberType))
        .or('b', object().field('y', booleanType))

      it('copies', function () {
        const c = copyTo(
          typeDef,
          {
            d: 'a',
            x: 1,
          },
          toString,
        )

        expect(c).toEqual({
          d: 'a',
          x: '1',
        })
      })
    })
  })
})

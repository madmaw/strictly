import { type AnyValueType, copyTo } from 'transformers/copies/copyTo'
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
import { type StrictTypeDef } from 'types/StrictType'
import { TypeDefType } from 'types/Type'

describe('copyTo', () => {
  function toString(v: AnyValueType, t: StrictTypeDef) {
    if (t.type === TypeDefType.Literal) {
      return JSON.stringify(v)
    }
    return v
  }

  describe('literal', () => {
    const type = literal<1>()
    it('copies', () => {
      const c = copyTo(type, 1, toString)
      expect(c).toEqual('1')
    })
  })

  describe('list', () => {
    const typeDef = list(literal<number>())
    it('copies', () => {
      const c = copyTo(typeDef, [1, 2, 3], toString)
      expect(c).toEqual(['1', '2', '3'])
    })
  })

  describe('record', () => {
    const typeDef = record<typeof numberType, 'a' | 'b'>(numberType)
    it('copies', () => {
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

  describe('object', () => {
    const typeDef = object()
      .field('a', numberType)
      .field('b', booleanType)
      .field('c', stringType)
    it('copies', () => {
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

  describe('union', () => {
    describe('non-discriminated', () => {
      const typeDef = union()
        .or('0', list(numberType))
        .or('1', literal(['b']))
        .or('2', literal([false]))
      it('copies string literal', () => {
        const c = copyTo(typeDef, 'b', toString)
        expect(c).toEqual('"b"')
      })

      it('copies boolean literal', () => {
        const c = copyTo(typeDef, false, toString)
        expect(c).toEqual('false')
      })
    })

    describe('discriminated', () => {
      const typeDef = union('d')
        .or('a', object().field('x', numberType))
        .or('b', object().field('y', booleanType))

      it('copies', () => {
        const c = copyTo(
          typeDef,
          {
            d: 'a',
            x: 1,
          },
          toString,
        )

        expect(c).toEqual({
          d: '"a"',
          x: '1',
        })
      })
    })
  })
})

import { type AnyValueType, copyTo } from 'define/transformers/copies/copyTo'
import {
  booleanType,
  list,
  literal,
  numberType,
  object,
  record,
  stringType,
  union,
} from 'define/types/builders'
import { nodeOf } from 'define/types/node'
import { type Type } from 'define/types/Type'

describe('copyTo', () => {
  function toString(v: AnyValueType, t: Type) {
    if (nodeOf(t).kind === 'literal') {
      return JSON.stringify(v)
    }
    return v
  }

  describe('literal', () => {
    const type = literal<1>().narrow
    it('copies', () => {
      const c = copyTo(type, 1, toString)
      expect(c).toEqual('1')
    })
  })

  describe('list', () => {
    const type = list(literal<number>()).narrow
    it('copies', () => {
      const c = copyTo(type, [1, 2, 3], toString)
      expect(c).toEqual(['1', '2', '3'])
    })
  })

  describe('record', () => {
    const type = record<typeof numberType, 'a' | 'b'>(numberType).narrow
    it('copies', () => {
      const c = copyTo(
        type,
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
    const type = object()
      .field('a', numberType)
      .field('b', booleanType)
      .field('c', stringType).narrow
    it('copies', () => {
      const c = copyTo(
        type,
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
      const type = union()
        .or('0', list(numberType))
        .or('1', literal(['b']))
        .or('2', literal([false])).narrow
      it('copies string literal', () => {
        const c = copyTo(type, 'b', toString)
        expect(c).toEqual('"b"')
      })

      it('copies boolean literal', () => {
        const c = copyTo(type, false, toString)
        expect(c).toEqual('false')
      })

      it('copies the non-literal option', () => {
        const c = copyTo(type, [1, 2], toString)
        expect(c).toEqual(['1', '2'])
      })
    })

    describe('discriminated', () => {
      const type = union('d')
        .or('a', object().field('x', numberType))
        .or('b', object().field('y', booleanType)).narrow

      it('copies', () => {
        const c = copyTo(
          type,
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

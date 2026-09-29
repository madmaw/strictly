import { flattenTypeTo } from 'transformers/flatteners/flattenTypeTo'
import {
  booleanType,
  list,
  nullType,
  numberType,
  object,
  record,
  union,
} from 'types/builders'
import { type TypeDef, TypeDefType } from 'types/Type'
import { type Mock, vi } from 'vite-plus/test'

describe('flattenTypeDefTo', () => {
  let toTypeDefType: Mock<(typeDef: TypeDef) => number>
  let flattened: Record<string, TypeDefType>

  beforeEach(() => {
    toTypeDefType = vi.fn((typeDef: TypeDef) => typeDef.type)
  })

  describe('literal', () => {
    beforeEach(() => {
      flattened = flattenTypeTo(numberType, toTypeDefType)
    })

    it('equals expected type', () => {
      expect(flattened).toEqual({
        $: TypeDefType.Literal,
      })
    })

    it('calls the mapper function', () => {
      expect(toTypeDefType).toHaveBeenCalledTimes(1)
    })
  })

  describe('list', () => {
    const type = list(numberType)
    beforeEach(() => {
      flattened = flattenTypeTo(type, toTypeDefType)
    })

    it('equals expected type', () => {
      expect(flattened).toEqual({
        $: TypeDefType.List,
        '$.*': TypeDefType.Literal,
      })
    })

    it('calls the mapper function', () => {
      expect(toTypeDefType).toHaveBeenCalledTimes(2)
    })
  })

  describe('record', () => {
    const type = record<typeof numberType, 'a' | 'b'>(numberType)
    beforeEach(() => {
      flattened = flattenTypeTo(type, toTypeDefType)
    })

    it('equals expected type', () => {
      expect(flattened).toEqual({
        $: TypeDefType.Record,
        '$.*': TypeDefType.Literal,
      })
    })

    it('calls the mapper function', () => {
      expect(toTypeDefType).toHaveBeenCalledTimes(2)
    })
  })

  describe('object', () => {
    const type = object().field('a', numberType).field('b', list(booleanType))
    beforeEach(() => {
      flattened = flattenTypeTo(type, toTypeDefType)
    })

    it('equals expected type', () => {
      expect(flattened).toEqual({
        $: TypeDefType.Object,
        '$.a': TypeDefType.Literal,
        '$.b': TypeDefType.List,
        '$.b.*': TypeDefType.Literal,
      })
    })

    it('calls the mapper function', () => {
      expect(toTypeDefType).toHaveBeenCalledTimes(4)
    })
  })

  describe('union', () => {
    describe('non-discriminated', () => {
      const type = union()
        .or('a', nullType)
        .or('b', booleanType)
        .or('c', numberType)
      beforeEach(() => {
        flattened = flattenTypeTo(type, toTypeDefType)
      })

      it('equals expected type', () => {
        expect(flattened).toEqual({
          $: TypeDefType.Union,
        })
      })

      it('calls the mapper function', () => {
        expect(toTypeDefType).toHaveBeenCalledTimes(1)
      })
    })

    describe('discriminated', () => {
      const type = union('d')
        .or('a', object().field('a', booleanType))
        .or('b', object().field('b', numberType))
      beforeEach(() => {
        flattened = flattenTypeTo(type, toTypeDefType)
      })

      it('equals expected type', () => {
        expect(flattened).toEqual({
          $: TypeDefType.Union,
          '$:a.a': TypeDefType.Literal,
          '$:a.d': TypeDefType.Literal,
          '$:b.b': TypeDefType.Literal,
          '$:b.d': TypeDefType.Literal,
        })
      })

      it('calls the mapper function', () => {
        expect(toTypeDefType).toHaveBeenCalledTimes(5)
      })
    })
  })
})

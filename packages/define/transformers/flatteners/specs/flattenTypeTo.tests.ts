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
import {
  type TypeDef,
  TypeDefType,
} from 'types/Definitions'
import {
  type Mock,
  vi,
} from 'vitest'

describe('flattenTypeDefTo', function () {
  let toTypeDefType: Mock<(typeDef: TypeDef) => number>
  let flattened: Record<string, TypeDefType>

  beforeEach(function () {
    toTypeDefType = vi.fn(function (typeDef: TypeDef) {
      return typeDef.type
    })
  })

  describe('literal', function () {
    beforeEach(function () {
      flattened = flattenTypeTo(numberType, toTypeDefType)
    })

    it('equals expected type', function () {
      expect(flattened).toEqual({
        $: TypeDefType.Literal,
      })
    })

    it('calls the mapper function', function () {
      expect(toTypeDefType).toHaveBeenCalledTimes(1)
    })
  })

  describe('list', function () {
    const type = list(numberType)
    beforeEach(function () {
      flattened = flattenTypeTo(type, toTypeDefType)
    })

    it('equals expected type', function () {
      expect(flattened).toEqual({
        $: TypeDefType.List,
        '$.*': TypeDefType.Literal,
      })
    })

    it('calls the mapper function', function () {
      expect(toTypeDefType).toHaveBeenCalledTimes(2)
    })
  })

  describe('record', function () {
    const type = record<typeof numberType, 'a' | 'b'>(numberType)
    beforeEach(function () {
      flattened = flattenTypeTo(type, toTypeDefType)
    })

    it('equals expected type', function () {
      expect(
        flattened,
      ).toEqual({
        $: TypeDefType.Record,
        '$.*': TypeDefType.Literal,
      })
    })

    it('calls the mapper function', function () {
      expect(toTypeDefType).toHaveBeenCalledTimes(2)
    })
  })

  describe('object', function () {
    const type = object()
      .field('a', numberType)
      .field('b', list(booleanType))
    beforeEach(function () {
      flattened = flattenTypeTo(type, toTypeDefType)
    })

    it('equals expected type', function () {
      expect(flattened).toEqual({
        $: TypeDefType.Object,
        '$.a': TypeDefType.Literal,
        '$.b': TypeDefType.List,
        '$.b.*': TypeDefType.Literal,
      })
    })

    it('calls the mapper function', function () {
      expect(toTypeDefType).toHaveBeenCalledTimes(4)
    })
  })

  describe('union', function () {
    describe('non-discriminated', function () {
      const type = union()
        .or('a', nullType)
        .or('b', booleanType)
        .or('c', numberType)
      beforeEach(function () {
        flattened = flattenTypeTo(type, toTypeDefType)
      })

      it('equals expected type', function () {
        expect(flattened).toEqual({
          $: TypeDefType.Union,
        })
      })

      it('calls the mapper function', function () {
        expect(toTypeDefType).toHaveBeenCalledTimes(1)
      })
    })

    describe('discriminated', function () {
      const type = union('d')
        .or('a', object().field('a', booleanType))
        .or('b', object().field('b', numberType))
      beforeEach(function () {
        flattened = flattenTypeTo(type, toTypeDefType)
      })

      it('equals expected type', function () {
        expect(flattened).toEqual({
          $: TypeDefType.Union,
          '$:a.a': TypeDefType.Literal,
          '$:b.b': TypeDefType.Literal,
        })
      })

      it('calls the mapper function', function () {
        expect(toTypeDefType).toHaveBeenCalledTimes(3)
      })
    })
  })
})

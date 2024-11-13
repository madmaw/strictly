import { flattenTypeDefTo } from 'transformers/flatteners/flatten_type_def_to'
import {
  boolean,
  list,
  map,
  nullTypeDefHolder,
  number,
  struct,
  union,
} from 'types/builders'
import {
  type TypeDef,
  TypeDefType,
} from 'types/definitions'
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
      flattened = flattenTypeDefTo(number, toTypeDefType)
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
    const typeDefHolder = list(number)
    beforeEach(function () {
      flattened = flattenTypeDefTo(typeDefHolder, toTypeDefType)
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

  describe('map', function () {
    const typeDefHolder = map<'a' | 'b', typeof number>(number)
    beforeEach(function () {
      flattened = flattenTypeDefTo(typeDefHolder, toTypeDefType)
    })

    it('equals expected type', function () {
      expect(
        flattened,
      ).toEqual({
        $: TypeDefType.Map,
        '$.*': TypeDefType.Literal,
      })
    })

    it('calls the mapper function', function () {
      expect(toTypeDefType).toHaveBeenCalledTimes(2)
    })
  })

  describe('struct', function () {
    const typeDefHolder = struct().set('a', number).set('b', list(boolean))
    beforeEach(function () {
      flattened = flattenTypeDefTo(typeDefHolder, toTypeDefType)
    })

    it('equals expected type', function () {
      expect(flattened).toEqual({
        $: TypeDefType.Structured,
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
      const typeDefHolder = union()
        .add('a', nullTypeDefHolder)
        .add('b', boolean)
        .add('c', number)
      beforeEach(function () {
        flattened = flattenTypeDefTo(typeDefHolder, toTypeDefType)
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
      const typeDefHolder = union('d')
        .add('a', struct().set('a', boolean))
        .add('b', struct().set('b', number))
      beforeEach(function () {
        flattened = flattenTypeDefTo(typeDefHolder, toTypeDefType)
      })

      it('equals expected type', function () {
        expect(flattened).toEqual({
          $: TypeDefType.Union,
          '$.a': TypeDefType.Literal,
          '$.b': TypeDefType.Literal,
          '$.d': TypeDefType.Literal,
        })
      })

      it('calls the mapper function', function () {
        expect(toTypeDefType).toHaveBeenCalledTimes(4)
      })
    })
  })
})

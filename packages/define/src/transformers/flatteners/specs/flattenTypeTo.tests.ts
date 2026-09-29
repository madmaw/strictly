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
import { nodeOf, type SchemaNode } from 'types/node'
import { type Type } from 'types/Type'
import { type Mock, vi } from 'vite-plus/test'

describe('flattenTypeTo', () => {
  let toKind: Mock<(t: Type) => SchemaNode['kind']>
  let flattened: Record<string, SchemaNode['kind']>

  beforeEach(() => {
    toKind = vi.fn((t: Type) => nodeOf(t).kind)
  })

  describe('literal', () => {
    beforeEach(() => {
      flattened = flattenTypeTo(numberType.narrow, toKind)
    })

    it('equals expected type', () => {
      expect(flattened).toEqual({
        $: 'literal',
      })
    })

    it('calls the mapper function', () => {
      expect(toKind).toHaveBeenCalledTimes(1)
    })
  })

  describe('list', () => {
    const type = list(numberType).narrow
    beforeEach(() => {
      flattened = flattenTypeTo(type, toKind)
    })

    it('equals expected type', () => {
      expect(flattened).toEqual({
        $: 'list',
        '$.*': 'literal',
      })
    })

    it('calls the mapper function', () => {
      expect(toKind).toHaveBeenCalledTimes(2)
    })
  })

  describe('record', () => {
    const type = record<typeof numberType, 'a' | 'b'>(numberType).narrow
    beforeEach(() => {
      flattened = flattenTypeTo(type, toKind)
    })

    it('equals expected type', () => {
      expect(flattened).toEqual({
        $: 'record',
        '$.*': 'literal',
      })
    })

    it('calls the mapper function', () => {
      expect(toKind).toHaveBeenCalledTimes(2)
    })
  })

  describe('object', () => {
    const type = object()
      .field('a', numberType)
      .field('b', list(booleanType)).narrow
    beforeEach(() => {
      flattened = flattenTypeTo(type, toKind)
    })

    it('equals expected type', () => {
      expect(flattened).toEqual({
        $: 'object',
        '$.a': 'literal',
        '$.b': 'list',
        '$.b.*': 'literal',
      })
    })

    it('calls the mapper function', () => {
      expect(toKind).toHaveBeenCalledTimes(4)
    })
  })

  describe('optional field', () => {
    const type = object().optionalField('a', list(booleanType)).narrow
    beforeEach(() => {
      flattened = flattenTypeTo(type, toKind)
    })

    it('reports the wrapper at the field path and flattens through it', () => {
      expect(flattened).toEqual({
        $: 'object',
        '$.a': 'wrapper',
        '$.a.*': 'literal',
      })
    })
  })

  describe('union', () => {
    describe('non-discriminated', () => {
      const type = union()
        .or('a', nullType)
        .or('b', booleanType)
        .or('c', numberType).narrow
      beforeEach(() => {
        flattened = flattenTypeTo(type, toKind)
      })

      it('equals expected type', () => {
        expect(flattened).toEqual({
          $: 'union',
        })
      })

      it('calls the mapper function', () => {
        expect(toKind).toHaveBeenCalledTimes(1)
      })
    })

    describe('discriminated', () => {
      const type = union('d')
        .or('a', object().field('a', booleanType))
        .or('b', object().field('b', numberType)).narrow
      beforeEach(() => {
        flattened = flattenTypeTo(type, toKind)
      })

      it('equals expected type', () => {
        expect(flattened).toEqual({
          $: 'union',
          '$:a.a': 'literal',
          '$:a.d': 'literal',
          '$:b.b': 'literal',
          '$:b.d': 'literal',
        })
      })

      it('calls the mapper function', () => {
        expect(toKind).toHaveBeenCalledTimes(5)
      })
    })
  })
})

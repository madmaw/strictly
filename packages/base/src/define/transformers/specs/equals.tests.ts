import { petType, rex } from 'define/specs/fixtures/pet'
import { copy } from 'define/transformers/copies/copy'
import { equals } from 'define/transformers/equals'
import {
  booleanType,
  list,
  nullable,
  nullType,
  numberType,
  object,
  record,
  stringType,
  union,
} from 'define/types/builders'

describe('equals', () => {
  describe('literal', () => {
    const type = numberType.narrow

    it('compares values', () => {
      expect(equals(type, 1, 1)).toBe(true)
      expect(equals(type, 1, 2)).toBe(false)
    })
  })

  describe('list', () => {
    const type = list(numberType).narrow

    it('compares elements', () => {
      expect(equals(type, [1, 2], [1, 2])).toBe(true)
      expect(equals(type, [1, 2], [2, 1])).toBe(false)
      expect(equals(type, [1], [1, 2])).toBe(false)
    })
  })

  describe('record', () => {
    const type = record<typeof numberType, string>(numberType).narrow

    it('compares keys and values', () => {
      expect(equals(type, { a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true)
      expect(equals(type, { a: 1, b: 2 }, { a: 1, b: 3 })).toBe(false)
      expect(equals(type, { a: 1, b: 2 }, { a: 1, b: 2, c: 3 })).toBe(false)
    })
  })

  describe('object', () => {
    const type = object()
      .field('a', numberType)
      .optionalField('b', stringType).narrow

    it('compares fields', () => {
      expect(equals(type, { a: 1 }, { a: 1 })).toBe(true)
      expect(equals(type, { a: 1, b: 'x' }, { a: 1, b: 'x' })).toBe(true)
      expect(equals(type, { a: 1 }, { a: 1, b: 'x' })).toBe(false)
    })
  })

  describe('nullable', () => {
    const type = nullable(object().field('a', numberType)).narrow

    it('compares null values', () => {
      expect(equals(type, null, null)).toBe(true)
      expect(equals(type, null, { a: 1 })).toBe(false)
      expect(equals(type, { a: 1 }, { a: 1 })).toBe(true)
    })
  })

  describe('union', () => {
    describe('non-discriminated', () => {
      const type = union().or('0', list(numberType)).or('1', nullType).narrow

      it('compares the literal and the non-literal options', () => {
        expect(equals(type, null, null)).toBe(true)
        expect(equals(type, [1], [1])).toBe(true)
        expect(equals(type, [1], [2])).toBe(false)
        expect(equals(type, [1], null)).toBe(false)
      })
    })

    describe('discriminated', () => {
      const type = union('d')
        .or('x', object().field('a', booleanType))
        .or('y', object().field('b', numberType)).narrow

      it('compares the option of the discriminator', () => {
        expect(equals(type, { d: 'x', a: true }, { d: 'x', a: true })).toBe(
          true,
        )
        expect(equals(type, { d: 'x', a: true }, { d: 'x', a: false })).toBe(
          false,
        )
        expect(equals(type, { d: 'x', a: true }, { d: 'y', b: 1 })).toBe(false)
      })
    })
  })

  describe('pet', () => {
    it('compares copies', () => {
      const pet = copy(petType, rex)
      expect(equals(petType, pet, copy(petType, rex))).toBe(true)
      expect(
        equals(
          petType,
          pet,
          copy(petType, {
            ...rex,
            species: {
              type: 'cat',
              meows: 2,
            },
          }),
        ),
      ).toBe(false)
      expect(
        equals(
          petType,
          pet,
          copy(petType, {
            ...rex,
            owner: null,
          }),
        ),
      ).toBe(false)
    })
  })
})

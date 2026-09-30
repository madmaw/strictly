import { petType, rex } from 'define/specs/fixtures/pet'
import { mobxCopy } from 'define/transformers/copies/mobxCopy'
import { numberType, object } from 'define/types/builders'
import { type ValueOfType } from 'define/types/ValueOfType'
import { isObservableArray, isObservableObject } from 'mobx'

describe('mobxCopy', () => {
  describe('object', () => {
    describe('optional field', () => {
      const type = object().optionalField('n', numberType).narrow
      type T = ValueOfType<typeof type>
      it('copies unpopulated', () => {
        const v: T = {}
        const c = mobxCopy(type, v)
        expect(c).toEqual(v)
      })

      it('copies populated', () => {
        const v: T = { n: 1 }
        const c = mobxCopy(type, v)
        expect(c).toEqual(v)
      })
    })
  })

  describe('pet', () => {
    const c = mobxCopy(petType, rex)

    it('copies', () => {
      expect(c).toEqual(rex)
    })

    it('observes the value through nullable and discriminated unions', () => {
      expect(isObservableObject(c)).toBe(true)
      expect(isObservableArray(c.tags)).toBe(true)
      expect(isObservableObject(c.owner)).toBe(true)
      expect(isObservableObject(c.species)).toBe(true)
    })

    it('leaves null values alone', () => {
      expect(mobxCopy(petType, { ...rex, owner: null }).owner).toBeNull()
    })
  })
})

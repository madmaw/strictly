import { mobxCopy } from 'transformers/copies/mobxCopy'
import { numberType, object } from 'types/builders'
import { type ValueOfType } from 'types/ValueOfType'

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
})

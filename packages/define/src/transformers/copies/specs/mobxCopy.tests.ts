import { mobxCopy } from 'transformers/copies/mobxCopy'
import {
  numberType,
  object,
} from 'types/builders'
import { type ValueOfType } from 'types/ValueOfType'

describe('mobxCopy', function () {
  describe('object', function () {
    describe('optional field', function () {
      const type = object().optionalField('n', numberType)
      type T = ValueOfType<typeof type>
      it('copies unpopulated', function () {
        const v: T = {}
        const c = mobxCopy(type, v)
        expect(c).toEqual(v)
      })

      it('copies populated', function () {
        const v: T = { n: 1 }
        const c = mobxCopy(type, v)
        expect(c).toEqual(v)
      })
    })
  })
})

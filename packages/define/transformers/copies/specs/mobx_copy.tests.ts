import { mobxCopy } from 'transformers/copies/mobx_copy'
import {
  numberType,
  object,
} from 'types/builders'
import { type ValueOfType } from 'types/value_of_type'

describe('mobxCopy', function () {
  describe('object', function () {
    describe('optional field', function () {
      const type = object().setOptional('n', numberType)
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

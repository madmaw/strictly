import { mobxCopy } from 'transformers/copies/mobx_copy'
import {
  numberType,
  object,
} from 'types/builders'
import { type ValueTypeOf } from 'types/value_type_of'

describe('mobxCopy', function () {
  describe('object', function () {
    describe('optional field', function () {
      const type = object().setOptional('n', numberType)
      type T = ValueTypeOf<typeof type>
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

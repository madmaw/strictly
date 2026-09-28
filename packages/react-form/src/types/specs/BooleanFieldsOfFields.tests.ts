import { type BooleanFieldsOfFields } from 'types/BooleanFieldsOfFields'
import { type Field } from 'types/Field'

describe('BooleanFieldsOfFields', function () {
  describe('filtering', function () {
    const e1 = Symbol()
    const e2 = Symbol()
    const e3 = Symbol()
    type E1 = typeof e1
    type E2 = typeof e2
    type E3 = typeof e3
    type F = {
      b: Field<boolean, E1>,
      s: Field<string, E2>,
      n: Field<number, E3>,
    }
    it('equals expected type', function () {
      expectTypeOf<BooleanFieldsOfFields<F>>().toEqualTypeOf<{
        b: Field<boolean, E1>,
      }>()
    })
  })
})

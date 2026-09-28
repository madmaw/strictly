import { type Field } from 'types/Field'
import { type StringFieldsOfFields } from 'types/StringFieldsOfFields'

describe('StringFieldsOfFields', () => {
  describe('filtering', () => {
    const e1 = Symbol()
    const e2 = Symbol()
    const e3 = Symbol()
    type E1 = typeof e1
    type E2 = typeof e2
    type E3 = typeof e3
    type F = {
      b: Field<boolean, E1>
      s: Field<string, E2>
      n: Field<number, E3>
    }

    it('equals expected type', () => {
      expectTypeOf<StringFieldsOfFields<F>>().toEqualTypeOf<{
        s: Field<string, E2>
      }>()
    })
  })

  describe('string union with null', () => {
    const e = Symbol()
    type E = typeof e
    type F = {
      s: Field<'a' | 'b' | 'c' | null | undefined, E>
    }

    describe('StringFieldsOfFields', () => {
      it('equals expected type', () => {
        expectTypeOf<StringFieldsOfFields<F>>().toEqualTypeOf<{
          s: Field<'a' | 'b' | 'c' | null | undefined, E>
        }>()
      })
    })
  })
})

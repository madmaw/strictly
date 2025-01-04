import { type ErrorOfField } from 'types/error_of_field'
import { type Field } from 'types/field'

describe('ErrorTypeOfField', function () {
  it('equals expected type', function () {
    const e = Symbol()
    type E = typeof e
    expectTypeOf<ErrorOfField<Field<unknown, E>>>().toEqualTypeOf<E>()
  })
})

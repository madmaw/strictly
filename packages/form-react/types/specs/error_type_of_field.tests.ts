import { type ErrorTypeOfField } from 'types/error_type_of_field'
import { type Field } from 'types/field'

describe('ErrorTypeOfField', function () {
  it('equals expected type', function () {
    const e = Symbol()
    type E = typeof e
    expectTypeOf<ErrorTypeOfField<Field<E, unknown>>>().toEqualTypeOf<E>()
  })
})

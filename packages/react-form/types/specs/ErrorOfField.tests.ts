import { type ErrorOfField } from 'types/ErrorOfField'
import { type Field } from 'types/Field'

describe('ErrorOfField', function () {
  it('equals expected type', function () {
    const e = Symbol()
    type E = typeof e
    expectTypeOf<ErrorOfField<Field<unknown, E>>>().toEqualTypeOf<E>()
  })
})

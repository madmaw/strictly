import { type ErrorOfField } from 'form/types/ErrorOfField'
import { type Field } from 'form/types/Field'

describe('ErrorOfField', () => {
  it('equals expected type', () => {
    const e = Symbol()
    type E = typeof e
    expectTypeOf<ErrorOfField<Field<unknown, E>>>().toEqualTypeOf<E>()
  })
})

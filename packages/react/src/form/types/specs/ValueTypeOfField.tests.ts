import { type Field } from 'form/types/Field'
import { type ValueTypeOfField } from 'form/types/ValueTypeOfField'

describe('ValueTypeOfField', () => {
  it('equals expected type', () => {
    const v = Symbol()
    type V = typeof v
    expectTypeOf<ValueTypeOfField<Field<V, unknown>>>().toEqualTypeOf<V>()
  })
})

import { type Field } from 'types/Field'
import { type ValueTypeOfField } from 'types/ValueTypeOfField'

describe('ValueTypeOfField', () => {
  it('equals expected type', () => {
    const v = Symbol()
    type V = typeof v
    expectTypeOf<ValueTypeOfField<Field<V, unknown>>>().toEqualTypeOf<V>()
  })
})

import { type Field } from 'types/field'
import { type ValueTypeOfField } from 'types/value_type_of_field'

describe('ValueTypeOfField', function () {
  it('equals expected type', function () {
    const v = Symbol()
    type V = typeof v
    expectTypeOf<ValueTypeOfField<Field<unknown, V>>>().toEqualTypeOf<V>()
  })
})

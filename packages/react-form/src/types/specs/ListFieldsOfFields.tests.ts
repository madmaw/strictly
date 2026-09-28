import { type Field } from 'types/Field'
import { type ListFieldsOfFields } from 'types/ListFieldsOfFields'

describe('ListFieldsOfFields', () => {
  it('matches the expected type of an empty set of fields', () => {
    type T = ListFieldsOfFields<{}>
    expectTypeOf<T>().toEqualTypeOf<{}>()
  })

  it('matches the expected type of a set of fields containing a single list', () => {
    type X = {
      l: Field<number[]>,
    }
    type T = ListFieldsOfFields<X>
    expectTypeOf<T>().toEqualTypeOf<X>()
  })

  it('matches the expected type of a set of fields containing a multiple fields, including a list', () => {
    type X = {
      readonly a: Field<number>,
      readonly b: Field<string>,
      readonly l: Field<readonly number[]>,
    }
    type T = ListFieldsOfFields<X>
    expectTypeOf<T>().toEqualTypeOf<{
      readonly l: Field<readonly number[]>,
    }>()
  })
})

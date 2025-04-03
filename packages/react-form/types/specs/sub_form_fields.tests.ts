import { type Simplify } from 'type-fest'
import { type Field } from 'types/field'
import { type SubFormFields } from 'types/sub_form_fields'

describe('SubFormFields', () => {
  it('works on single field', () => {
    type T = Simplify<SubFormFields<{ $: Field }, '$'>>
    expectTypeOf<T>().toEqualTypeOf<{ $: Field }>()
  })

  it('works on more two fields', () => {
    type T = Simplify<SubFormFields<{ '$.a': Field<string>, '$.b': Field<boolean> }, '$.a'>>
    expectTypeOf<T>().toEqualTypeOf<{ $: Field<string> }>()
  })

  it('works on subfields', () => {
    type T = Simplify<
      SubFormFields<{ $: Field<null>, '$.a': Field<string>, '$.a.b': Field<boolean>, '$.a.b.c': Field<number> }, '$.a'>
    >
    expectTypeOf<T>().toEqualTypeOf<{ $: Field<string>, '$.b': Field<boolean>, '$.b.c': Field<number> }>()
  })
})

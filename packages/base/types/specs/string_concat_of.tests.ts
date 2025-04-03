import { type StringConcatOf } from 'types/string_concat_of'

describe('StringConcatOf', () => {
  it('concatenates', () => {
    expectTypeOf<StringConcatOf<'a', 'b'>>().toEqualTypeOf<'ab'>()
  })
})

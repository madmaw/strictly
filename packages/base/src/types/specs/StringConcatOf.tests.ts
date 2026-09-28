import { type StringConcatOf } from 'types/StringConcatOf'

describe('StringConcatOf', () => {
  it('concatenates', () => {
    expectTypeOf<StringConcatOf<'a', 'b'>>().toEqualTypeOf<'ab'>()
  })
})

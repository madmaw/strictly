import { type ElementOfArray } from 'types/element_of_array'

describe('ElementOfArray', function () {
  type A = readonly number[]

  it('extracts the element type', function () {
    expectTypeOf<ElementOfArray<A>>().toEqualTypeOf<number>()
  })
})

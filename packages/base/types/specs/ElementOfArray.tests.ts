import { type ElementOfArray } from 'types/ElementOfArray'

describe('ElementOfArray', function () {
  type A = readonly number[]

  it('extracts the element type', function () {
    expectTypeOf<ElementOfArray<A>>().toEqualTypeOf<number>()
  })
})

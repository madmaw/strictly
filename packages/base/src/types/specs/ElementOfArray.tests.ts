import { type ElementOfArray } from 'types/ElementOfArray'

describe('ElementOfArray', () => {
  type A = readonly number[]

  it('extracts the element type', () => {
    expectTypeOf<ElementOfArray<A>>().toEqualTypeOf<number>()
  })
})

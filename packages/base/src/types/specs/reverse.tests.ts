import { type Reverse } from 'types/Reverse'

describe('Reverse', function () {
  it('reverses empty', function () {
    type T = Reverse<{}>

    expectTypeOf<T>().toEqualTypeOf<{}>()
  })

  it('reverses single', function () {
    type T = Reverse<{
      a: 1,
    }>
    expectTypeOf<T>().toEqualTypeOf<{
      readonly 1: 'a',
    }>()
  })

  it('keys collide', function () {
    type T = Reverse<{
      a: 1,
      b: 1,
      c: 1,
    }>
    expectTypeOf<T>().toEqualTypeOf<{
      readonly 1: 'a' | 'b' | 'c',
    }>()
  })

  it('multiple entries', function () {
    type T = Reverse<{
      a: 1,
      b: 2,
      c: 3,
    }>
    expectTypeOf<T>().toEqualTypeOf<{
      readonly 1: 'a',
      readonly 2: 'b',
      readonly 3: 'c',
    }>()
  })

  it('to dynamic key', function () {
    type T = Reverse<{
      a: `x.${number}`,
    }>

    expectTypeOf<T>().toEqualTypeOf<{
      readonly [_: `x.${number}`]: 'a',
    }>()
  })

  it('from dynamic key', function () {
    type T = Reverse<{
      [x: `x.${number}`]: 'a',
    }>

    expectTypeOf<T>().toEqualTypeOf<{
      readonly a: `x.${number}`,
    }>()
  })
})

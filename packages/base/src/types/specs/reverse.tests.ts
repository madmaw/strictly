import { type Reverse } from 'types/Reverse'

describe('Reverse', () => {
  it('reverses empty', () => {
    type T = Reverse<{}>

    expectTypeOf<T>().toEqualTypeOf<{}>()
  })

  it('reverses single', () => {
    type T = Reverse<{
      a: 1
    }>
    expectTypeOf<T>().toEqualTypeOf<{
      readonly 1: 'a'
    }>()
  })

  it('keys collide', () => {
    type T = Reverse<{
      a: 1
      b: 1
      c: 1
    }>
    expectTypeOf<T>().toEqualTypeOf<{
      readonly 1: 'a' | 'b' | 'c'
    }>()
  })

  it('multiple entries', () => {
    type T = Reverse<{
      a: 1
      b: 2
      c: 3
    }>
    expectTypeOf<T>().toEqualTypeOf<{
      readonly 1: 'a'
      readonly 2: 'b'
      readonly 3: 'c'
    }>()
  })

  it('to dynamic key', () => {
    type T = Reverse<{
      a: `x.${number}`
    }>

    expectTypeOf<T>().toEqualTypeOf<{
      readonly [_: `x.${number}`]: 'a'
    }>()
  })

  it('from dynamic key', () => {
    type T = Reverse<{
      [x: `x.${number}`]: 'a'
    }>

    expectTypeOf<T>().toEqualTypeOf<{
      readonly a: `x.${number}`
    }>()
  })
})

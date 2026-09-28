import { type IsFieldReadonly } from 'types/IsFieldReadonly'

describe('IsFieldReadonly', () => {
  it('detects readonly', () => {
    type T = IsFieldReadonly<{ readonly a: 1 }, 'a'>

    expectTypeOf<true>().toEqualTypeOf<T>()
  })

  it('detects mutable', () => {
    type T = IsFieldReadonly<{ a: 1 }, 'a'>

    expectTypeOf<false>().toEqualTypeOf<T>()
  })
})

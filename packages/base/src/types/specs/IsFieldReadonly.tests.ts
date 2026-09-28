import { type IsFieldReadonly } from 'types/IsFieldReadonly'

describe('IsFieldReadonly', function () {
  it('detects readonly', function () {
    type T = IsFieldReadonly<{ readonly a: 1 }, 'a'>

    expectTypeOf<true>().toEqualTypeOf<T>()
  })

  it('detects mutable', function () {
    type T = IsFieldReadonly<{ a: 1 }, 'a'>

    expectTypeOf<false>().toEqualTypeOf<T>()
  })
})

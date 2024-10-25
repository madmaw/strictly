import {
  list,
  map,
  nullable,
  number,
  partial,
  readonly,
  string,
  struct,
  union,
} from 'types/defs/builders'
import { type ReadonlyTypeDefOf } from 'types/defs/readonly_type_def_of'

describe('ReadonlyTypeDefOf', function () {
  describe('literal', function () {
    type T = ReadonlyTypeDefOf<typeof number>

    let t: {
      readonly valuePrototype: number,
    }
    it('equals expected type', function () {
      expectTypeOf(t).toEqualTypeOf<T>()
    })
  })

  describe('list', function () {
    const builder = list(number)
    type T = ReadonlyTypeDefOf<typeof builder>

    let t: {
      readonly toReadonlyTypeDef: {
        readonly elements: {
          readonly valuePrototype: number,
        },
      },
    }
    it('equals expected type', function () {
      expectTypeOf(t).toEqualTypeOf<T>()
    })
  })

  describe('map', function () {
    const builder = map<'a' | 'b', typeof number>(number)
    type T = ReadonlyTypeDefOf<typeof builder>

    let t: {
      readonly toReadonlyTypeDef: {
        readonly keyPrototype: 'a' | 'b',
        readonly valueTypeDef: {
          readonly valuePrototype: number,
        },
      },
    }
    it('equals expected type', function () {
      expectTypeOf(t).toEqualTypeOf<T>()
    })
  })

  describe('struct', function () {
    const builder = struct()
      .set('a', number)
      .setOptional('b', string)
    type T = ReadonlyTypeDefOf<typeof builder>

    let t: {
      readonly fields: {
        readonly a: {
          readonly valuePrototype: number,
        },
        readonly b?: {
          readonly valuePrototype: string,
        },
      },
    }
    it('equals expected type', function () {
      expectTypeOf(t).toEqualTypeOf<T>()
    })
  })

  describe('union', function () {
    const builder = union()
      .add(1, map<'a', typeof number>(number))
      .add(2, string)
    type T = ReadonlyTypeDefOf<typeof builder>

    let t: {
      readonly unions: {
        readonly [1]: {
          readonly toReadonlyTypeDef: {
            readonly keyPrototype: 'a',
            readonly valueTypeDef: {
              readonly valuePrototype: number,
            },
          },
        },
        readonly [2]: {
          readonly valuePrototype: string,
        },
      },
    }
    it('equals expected type', function () {
      expectTypeOf(t).toEqualTypeOf<T>()
    })
  })

  describe('nullable', function () {
    const builder = nullable(map<'a', typeof number>(number))
    type T = ReadonlyTypeDefOf<typeof builder>

    let t: {
      readonly toNullableTypeDef: {
        readonly toReadonlyTypeDef: {
          readonly keyPrototype: 'a',
          readonly valueTypeDef: {
            readonly valuePrototype: number,
          },
        },
      },
    }
    it('equals expected type', function () {
      expectTypeOf(t).toEqualTypeOf<T>()
    })
  })

  describe('partial', function () {
    const builder = partial(map<'a', typeof number>(number))
    type T = ReadonlyTypeDefOf<typeof builder>

    let t: {
      readonly toPartialTypeDef: {
        readonly toReadonlyTypeDef: {
          readonly keyPrototype: 'a',
          readonly valueTypeDef: {
            readonly valuePrototype: number,
          },
        },
      },
    }
    it('equals expected type', function () {
      expectTypeOf(t).toEqualTypeOf<T>()
    })
  })

  describe('readonly', function () {
    const builder = readonly(map<'a', typeof number>(number))
    type T = ReadonlyTypeDefOf<typeof builder>

    let t: {
      readonly toReadonlyTypeDef: {
        readonly keyPrototype: 'a',
        readonly valueTypeDef: {
          readonly valuePrototype: number,
        },
      },
    }
    it('equals expected type', function () {
      expectTypeOf(t).toEqualTypeOf<T>()
    })
  })
})

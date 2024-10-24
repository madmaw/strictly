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
    const { typeDef } = number
    type T = ReadonlyTypeDefOf<typeof typeDef>

    let t: {
      readonly valuePrototype: number,
    }
    it('equals expected type', function () {
      expectTypeOf(t).toEqualTypeOf<T>()
    })
  })

  describe('list', function () {
    const { typeDef } = list(number)
    type T = ReadonlyTypeDefOf<typeof typeDef>

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
    const { typeDef } = map<'a' | 'b', typeof number.typeDef>(number)
    type T = ReadonlyTypeDefOf<typeof typeDef>

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
    const { typeDef } = struct()
      .set('a', number)
      .setOptional('b', string)
    type T = ReadonlyTypeDefOf<typeof typeDef>

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
    const { typeDef } = union()
      .add(1, map<'a', typeof number.typeDef>(number))
      .add(2, string)
    type T = ReadonlyTypeDefOf<typeof typeDef>

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
    const { typeDef } = nullable(map<'a', typeof number.typeDef>(number))
    type T = ReadonlyTypeDefOf<typeof typeDef>

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
    const { typeDef } = partial(map<'a', typeof number.typeDef>(number))
    type T = ReadonlyTypeDefOf<typeof typeDef>

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
    const { typeDef } = readonly(map<'a', typeof number.typeDef>(number))
    type T = ReadonlyTypeDefOf<typeof typeDef>

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

import {
  list,
  map,
  nullable,
  number,
  readonly,
  string,
  struct,
  union,
} from 'types/defs/builders'
import { type PartialTypeDefOf } from 'types/defs/partial_type_def_of'

describe('PartialTypeDefOf', function () {
  describe('literal', function () {
    const { typeDef } = number
    type T = PartialTypeDefOf<typeof typeDef>

    let t: {
      readonly toNullableTypeDef: {
        readonly valuePrototype: number,
      },
    }

    it('equals expected type', function () {
      expectTypeOf(t).toEqualTypeOf<T>()
    })
  })

  describe('list', function () {
    const { typeDef } = list(number)
    type T = PartialTypeDefOf<typeof typeDef>

    let t: {
      readonly toNullableTypeDef: {
        readonly elements: {
          readonly toNullableTypeDef: {
            readonly valuePrototype: number,
          },
        },
      },
    }
    it('equals expected type', function () {
      expectTypeOf(t).toEqualTypeOf<T>()
    })
  })

  describe('map', function () {
    const { typeDef } = map<'a' | 'b', typeof number.typeDef>(number)
    type T = PartialTypeDefOf<typeof typeDef>

    let t: {
      readonly toNullableTypeDef: {
        readonly toPartialTypeDef: {
          readonly keyPrototype: 'a' | 'b',
          readonly valueTypeDef: {
            readonly toNullableTypeDef: {
              readonly valuePrototype: number,
            },
          },
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
      .setReadonly('b', string)
    type T = PartialTypeDefOf<typeof typeDef>

    let t: {
      readonly toNullableTypeDef: {
        readonly fields: {
          a?: {
            readonly toNullableTypeDef: {
              readonly valuePrototype: number,
            },
          },
          readonly b?: {
            readonly toNullableTypeDef: {
              readonly valuePrototype: string,
            },
          },
        },
      },
    }

    it('equals expected type', function () {
      expectTypeOf(t).toEqualTypeOf<T>()
    })
  })

  describe('union', function () {
    describe('simple', function () {
      const { typeDef } = union()
        .add(1, number)
        .add(2, string)
      type T = PartialTypeDefOf<typeof typeDef>

      let t: {
        readonly toNullableTypeDef: {
          readonly unions: {
            readonly 1: {
              readonly valuePrototype: number,
            },
            readonly 2: {
              readonly valuePrototype: string,
            },
          },
        },
      }

      it('equals expected type', function () {
        expectTypeOf(t).toEqualTypeOf<T>()
      })
    })
  })

  describe('nullable', function () {
    const { typeDef } = nullable(number)
    type T = PartialTypeDefOf<typeof typeDef>

    let t: {
      readonly toNullableTypeDef: {
        readonly valuePrototype: number,
      },
    }
    it('equals expected type', function () {
      expectTypeOf(t).toEqualTypeOf<T>()
    })
  })

  describe('readonly', function () {
    const { typeDef } = readonly(list(number))
    type T = PartialTypeDefOf<typeof typeDef>

    let t: {
      readonly toNullableTypeDef: {
        readonly toReadonlyTypeDef: {
          readonly elements: {
            readonly toNullableTypeDef: {
              readonly valuePrototype: number,
            },
          },
        },
      },
    }
    it('equals expected type', function () {
      expectTypeOf(t).toEqualTypeOf<T>()
    })
  })
})

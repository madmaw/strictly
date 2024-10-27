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
    type T = PartialTypeDefOf<typeof number>

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
    const builder = list(number)
    type T = PartialTypeDefOf<typeof builder>

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
    const builder = map<'a' | 'b', typeof number>(number)
    type T = PartialTypeDefOf<typeof builder>

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
    const builder = struct()
      .set('a', number)
      .setReadonly('b', string)
    type T = PartialTypeDefOf<typeof builder>

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
      const builder = union()
        .add(1, number)
        .add(2, string)
      type T = PartialTypeDefOf<typeof builder>

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
    const builder = nullable(number)
    type T = PartialTypeDefOf<typeof builder>

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
    const builder = readonly(list(number))
    type T = PartialTypeDefOf<typeof builder>

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

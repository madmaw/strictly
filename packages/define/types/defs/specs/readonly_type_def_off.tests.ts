import { type TypeDefType } from 'types/defs'
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
import { type ReadonlyTypeDefOf } from 'types/defs/readonly_type_def_of'

describe('ReadonlyTypeDefOf', function () {
  describe('literal', function () {
    type T = ReadonlyTypeDefOf<typeof number>

    let t: {
      readonly typeDef: {
        readonly type: TypeDefType.Literal,
        readonly valuePrototype: number,
      },
    }
    it('equals expected type', function () {
      expectTypeOf(t).toEqualTypeOf<T>()
    })
  })

  describe('list', function () {
    const builder = list(number)
    type T = ReadonlyTypeDefOf<typeof builder>

    let t: {
      readonly typeDef: {
        readonly type: TypeDefType.Readonly,
        readonly toReadonlyTypeDef: {
          readonly type: TypeDefType.List,
          readonly elements: {
            readonly type: TypeDefType.Literal,
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
    type T = ReadonlyTypeDefOf<typeof builder>

    let t: {
      readonly typeDef: {
        readonly type: TypeDefType.Readonly,
        readonly toReadonlyTypeDef: {
          readonly type: TypeDefType.Map,
          readonly keyPrototype: 'a' | 'b',
          readonly valueTypeDef: {
            readonly type: TypeDefType.Literal,
            readonly valuePrototype: number,
          },
          readonly partial: false,
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
      readonly typeDef: {
        readonly type: TypeDefType.Structured,
        readonly fields: {
          readonly a: {
            readonly type: TypeDefType.Literal,
            readonly valuePrototype: number,
          },
          readonly b?: {
            readonly type: TypeDefType.Literal,
            readonly valuePrototype: string,
          },
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
      readonly typeDef: {
        readonly type: TypeDefType.Union,
        readonly unions: {
          readonly [1]: {
            readonly type: TypeDefType.Readonly,
            readonly toReadonlyTypeDef: {
              readonly type: TypeDefType.Map,
              readonly keyPrototype: 'a',
              readonly valueTypeDef: {
                readonly type: TypeDefType.Literal,
                readonly valuePrototype: number,
              },
              readonly partial: false,
            },
          },
          readonly [2]: {
            readonly type: TypeDefType.Literal,
            readonly valuePrototype: string,
          },
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
      readonly typeDef: {
        readonly type: TypeDefType.Nullable,
        readonly toNullableTypeDef: {
          readonly type: TypeDefType.Readonly,
          readonly toReadonlyTypeDef: {
            readonly type: TypeDefType.Map,
            readonly keyPrototype: 'a',
            readonly valueTypeDef: {
              readonly type: TypeDefType.Literal,
              readonly valuePrototype: number,
            },
            readonly partial: false,
          },
        },
      },
    }
    it('equals expected type', function () {
      expectTypeOf(t).toEqualTypeOf<T>()
    })
  })

  describe('partial', function () {
    const builder = map<'a', typeof number>(number).partial()
    type T = ReadonlyTypeDefOf<typeof builder>

    let t: {
      readonly typeDef: {
        readonly type: TypeDefType.Readonly,
        readonly toReadonlyTypeDef: {
          readonly type: TypeDefType.Map,
          readonly keyPrototype: 'a',
          readonly valueTypeDef: {
            readonly type: TypeDefType.Literal,
            readonly valuePrototype: number,
          },
          readonly partial: true,
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
      readonly typeDef: {
        readonly type: TypeDefType.Readonly,
        readonly toReadonlyTypeDef: {
          readonly type: TypeDefType.Map,
          readonly keyPrototype: 'a',
          readonly valueTypeDef: {
            readonly type: TypeDefType.Literal,
            readonly valuePrototype: number,
          },
          readonly partial: false,
        },
      },
    }
    it('equals expected type', function () {
      expectTypeOf(t).toEqualTypeOf<T>()
    })
  })
})

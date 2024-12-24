import {
  list,
  number,
  object,
  record,
  string,
  union,
} from 'types/builders'
import { type TypeDefType } from 'types/definitions'
import { type ReadonlyTypeDefOf } from 'types/readonly_type_def_of'

describe('ReadonlyTypeDefOf', function () {
  describe('literal', function () {
    type T = ReadonlyTypeDefOf<typeof number>

    let t: {
      readonly typeDef: {
        readonly type: TypeDefType.Literal,
        readonly valuePrototype: [number],
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
        readonly type: TypeDefType.List,
        readonly elements: {
          readonly type: TypeDefType.Literal,
          readonly valuePrototype: [number],
        },
      },
    }
    it('equals expected type', function () {
      expectTypeOf(t).toEqualTypeOf<T>()
    })
  })

  describe('record', function () {
    const builder = record<typeof number, 'a' | 'b'>(number)
    type T = ReadonlyTypeDefOf<typeof builder>

    let t: {
      readonly typeDef: {
        readonly type: TypeDefType.Record,
        readonly keyPrototype: 'a' | 'b',
        readonly valueTypeDef: {
          readonly type: TypeDefType.Literal,
          readonly valuePrototype: [number],
        },
      },
    }
    it('equals expected type', function () {
      expectTypeOf(t).toEqualTypeOf<T>()
    })
  })

  describe('object', function () {
    const builder = object()
      .set('a', number)
      .setOptional('b', string)
    type T = ReadonlyTypeDefOf<typeof builder>

    let t: {
      readonly typeDef: {
        readonly type: TypeDefType.Object,
        readonly fields: {
          readonly a: {
            readonly type: TypeDefType.Literal,
            readonly valuePrototype: [number],
          },
          readonly b?: {
            readonly type: TypeDefType.Literal,
            readonly valuePrototype: [string],
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
      .add('1', record<typeof number, 'a'>(number))
      .add('2', string)
    type T = ReadonlyTypeDefOf<typeof builder>

    let t: {
      readonly typeDef: {
        readonly type: TypeDefType.Union,
        readonly discriminator: null,
        readonly unions: {
          readonly [1]: {
            readonly type: TypeDefType.Record,
            readonly keyPrototype: 'a',
            readonly valueTypeDef: {
              readonly type: TypeDefType.Literal,
              readonly valuePrototype: [number],
            },
          },
          readonly [2]: {
            readonly type: TypeDefType.Literal,
            readonly valuePrototype: [string],
          },
        },
      },
    }
    it('equals expected type', function () {
      expectTypeOf(t).toEqualTypeOf<T>()
    })
  })

  describe('partial', function () {
    const builder = record<typeof number, 'a'>(number).partial()
    type T = ReadonlyTypeDefOf<typeof builder>

    let t: {
      readonly typeDef: {
        readonly type: TypeDefType.Record,
        readonly keyPrototype: 'a',
        readonly valueTypeDef: {
          readonly type: TypeDefType.Literal,
          readonly valuePrototype: [number],
        } | undefined,
      },
    }
    it('equals expected type', function () {
      expectTypeOf(t).toEqualTypeOf<T>()
    })
  })

  describe('readonly', function () {
    const builder = record<typeof number, 'a'>(number).readonly()
    type T = ReadonlyTypeDefOf<typeof builder>

    let t: {
      readonly typeDef: {
        readonly type: TypeDefType.Record,
        readonly keyPrototype: 'a',
        readonly valueTypeDef: {
          readonly type: TypeDefType.Literal,
          readonly valuePrototype: [number],
        },
      },
    }
    it('equals expected type', function () {
      expectTypeOf(t).toEqualTypeOf<T>()
    })
  })
})

import {
  list,
  numberType,
  object,
  record,
  stringType,
  union,
} from 'types/builders'
import { type TypeDefType } from 'types/definitions'
import { type ReadonlyTypeOfType } from 'types/readonly_type_of_type'

describe('ReadonlyTypeDefOf', function () {
  describe('literal', function () {
    type T = ReadonlyTypeOfType<typeof numberType._type>

    type C = {
      readonly definition: {
        readonly type: TypeDefType.Literal,
        readonly valuePrototype: [number],
      },
    }
    it('equals expected type', function () {
      expectTypeOf<C>().toEqualTypeOf<T>()
    })
  })

  describe('list', function () {
    const builder = list(numberType)
    type T = ReadonlyTypeOfType<typeof builder._type>

    type C = {
      readonly definition: {
        readonly type: TypeDefType.List,
        readonly elements: {
          readonly type: TypeDefType.Literal,
          readonly valuePrototype: [number],
        },
      },
    }
    it('equals expected type', function () {
      expectTypeOf<C>().toEqualTypeOf<T>()
    })
  })

  describe('record', function () {
    const builder = record<typeof numberType, 'a' | 'b'>(numberType)
    type T = ReadonlyTypeOfType<typeof builder._type>

    type C = {
      readonly definition: {
        readonly type: TypeDefType.Record,
        readonly keyPrototype: 'a' | 'b',
        readonly valueTypeDef: {
          readonly type: TypeDefType.Literal,
          readonly valuePrototype: [number],
        },
      },
    }
    it('equals expected type', function () {
      expectTypeOf<C>().toEqualTypeOf<T>()
    })
  })

  describe('object', function () {
    const builder = object()
      .field('a', numberType)
      .optionalField('b', stringType)
    type T = ReadonlyTypeOfType<typeof builder._type>

    type C = {
      readonly definition: {
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
      expectTypeOf<C>().toEqualTypeOf<T>()
    })
  })

  describe('union', function () {
    const builder = union()
      .or('1', record<typeof numberType, 'a'>(numberType))
      .or('2', stringType)
    type T = ReadonlyTypeOfType<typeof builder._type>

    type C = {
      readonly definition: {
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
      expectTypeOf<C>().toEqualTypeOf<T>()
    })
  })

  describe('partial', function () {
    const builder = record<typeof numberType, 'a'>(numberType).partialKeys()
    type T = ReadonlyTypeOfType<typeof builder._type>

    type C = {
      readonly definition: {
        readonly type: TypeDefType.Record,
        readonly keyPrototype: 'a',
        readonly valueTypeDef: {
          readonly type: TypeDefType.Literal,
          readonly valuePrototype: [number],
        } | undefined,
      },
    }
    it('equals expected type', function () {
      expectTypeOf<C>().toEqualTypeOf<T>()
    })
  })

  describe('readonly', function () {
    const builder = record<typeof numberType, 'a'>(numberType).readonlyKeys()
    type T = ReadonlyTypeOfType<typeof builder._type>

    type C = {
      readonly definition: {
        readonly type: TypeDefType.Record,
        readonly keyPrototype: 'a',
        readonly valueTypeDef: {
          readonly type: TypeDefType.Literal,
          readonly valuePrototype: [number],
        },
      },
    }
    it('equals expected type', function () {
      expectTypeOf<C>().toEqualTypeOf<T>()
    })
  })
})

import {
  list,
  numberType,
  object,
  record,
  stringType,
  union,
} from 'types/builders'
import { type ReadonlyTypeOfType } from 'types/ReadonlyTypeOfType'
import { type TypeDefType } from 'types/Type'

describe('ReadonlyTypeDefOf', () => {
  describe('literal', () => {
    type T = ReadonlyTypeOfType<typeof numberType._type>

    type C = {
      readonly definition: {
        readonly type: TypeDefType.Literal
        readonly valuePrototype: [number]
      }
    }
    it('equals expected type', () => {
      expectTypeOf<C>().toEqualTypeOf<T>()
    })
  })

  describe('list', () => {
    const builder = list(numberType)
    type T = ReadonlyTypeOfType<typeof builder._type>

    type C = {
      readonly definition: {
        readonly type: TypeDefType.List
        readonly elements: {
          readonly type: TypeDefType.Literal
          readonly valuePrototype: [number]
        }
      }
    }
    it('equals expected type', () => {
      expectTypeOf<C>().toEqualTypeOf<T>()
    })
  })

  describe('record', () => {
    const builder = record<typeof numberType, 'a' | 'b'>(numberType)
    type T = ReadonlyTypeOfType<typeof builder._type>

    type C = {
      readonly definition: {
        readonly type: TypeDefType.Record
        readonly keyPrototype: 'a' | 'b'
        readonly valueTypeDef: {
          readonly type: TypeDefType.Literal
          readonly valuePrototype: [number]
        }
      }
    }
    it('equals expected type', () => {
      expectTypeOf<C>().toEqualTypeOf<T>()
    })
  })

  describe('object', () => {
    const builder = object()
      .field('a', numberType)
      .optionalField('b', stringType)
    type T = ReadonlyTypeOfType<typeof builder._type>

    type C = {
      readonly definition: {
        readonly type: TypeDefType.Object
        readonly fields: {
          readonly a: {
            readonly type: TypeDefType.Literal
            readonly valuePrototype: [number]
          }
          readonly b?: {
            readonly type: TypeDefType.Literal
            readonly valuePrototype: [string]
          }
        }
      }
    }
    it('equals expected type', () => {
      expectTypeOf<C>().toEqualTypeOf<T>()
    })
  })

  describe('union', () => {
    const builder = union()
      .or('1', record<typeof numberType, 'a'>(numberType))
      .or('2', stringType)
    type T = ReadonlyTypeOfType<typeof builder._type>

    type C = {
      readonly definition: {
        readonly type: TypeDefType.Union
        readonly discriminator: null
        readonly unions: {
          readonly [1]: {
            readonly type: TypeDefType.Record
            readonly keyPrototype: 'a'
            readonly valueTypeDef: {
              readonly type: TypeDefType.Literal
              readonly valuePrototype: [number]
            }
          }
          readonly [2]: {
            readonly type: TypeDefType.Literal
            readonly valuePrototype: [string]
          }
        }
      }
    }
    it('equals expected type', () => {
      expectTypeOf<C>().toEqualTypeOf<T>()
    })
  })

  describe('partial', () => {
    const builder = record<typeof numberType, 'a'>(numberType).partialKeys()
    type T = ReadonlyTypeOfType<typeof builder._type>

    type C = {
      readonly definition: {
        readonly type: TypeDefType.Record
        readonly keyPrototype: 'a'
        readonly valueTypeDef:
          | {
              readonly type: TypeDefType.Literal
              readonly valuePrototype: [number]
            }
          | undefined
      }
    }
    it('equals expected type', () => {
      expectTypeOf<C>().toEqualTypeOf<T>()
    })
  })

  describe('readonly', () => {
    const builder = record<typeof numberType, 'a'>(numberType).readonlyKeys()
    type T = ReadonlyTypeOfType<typeof builder._type>

    type C = {
      readonly definition: {
        readonly type: TypeDefType.Record
        readonly keyPrototype: 'a'
        readonly valueTypeDef: {
          readonly type: TypeDefType.Literal
          readonly valuePrototype: [number]
        }
      }
    }
    it('equals expected type', () => {
      expectTypeOf<C>().toEqualTypeOf<T>()
    })
  })
})

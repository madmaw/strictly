import { type SimplifyDeep } from 'type-fest'
import {
  list,
  numberType,
  object,
  record,
  stringType,
  union,
} from 'types/builders'
import { type PartialTypeOfType } from 'types/PartialTypeOfType'
import { type TypeDefType } from 'types/Type'

describe('PartialTypeDefOf', () => {
  describe('literal', () => {
    type T = PartialTypeOfType<typeof numberType._type>

    type C = {
      readonly typeDef: {
        readonly type: TypeDefType.Union
        readonly discriminator: null
        readonly unions: {
          readonly [0]: {
            readonly type: TypeDefType.Literal
            readonly valuePrototype: [number]
          }
          readonly [1]: {
            readonly type: TypeDefType.Literal
            readonly valuePrototype: [null]
          }
        }
      }
    }

    it('equals expected type', () => {
      expectTypeOf<C>().toEqualTypeOf<T>()
    })
  })

  describe('list', () => {
    const builder = list(numberType)
    type T = PartialTypeOfType<typeof builder._type>

    type C = {
      readonly typeDef: {
        readonly type: TypeDefType.Union
        readonly discriminator: null
        readonly unions: {
          readonly [0]: {
            readonly type: TypeDefType.List
            readonly elements: {
              readonly type: TypeDefType.Union
              readonly discriminator: null
              readonly unions: {
                readonly [0]: {
                  readonly type: TypeDefType.Literal
                  readonly valuePrototype: [number]
                }
                readonly [1]: {
                  readonly type: TypeDefType.Literal
                  readonly valuePrototype: [null]
                }
              }
            }
          }
          readonly [1]: {
            readonly type: TypeDefType.Literal
            readonly valuePrototype: [null]
          }
        }
      }
    }
    it('equals expected type', () => {
      expectTypeOf<C>().toEqualTypeOf<T>()
    })
  })

  describe('record', () => {
    const builder = record<typeof numberType, 'a' | 'b'>(numberType)
    type T = SimplifyDeep<PartialTypeOfType<typeof builder._type>>

    type C = {
      readonly typeDef: {
        readonly type: TypeDefType.Union
        readonly discriminator: null
        readonly unions: {
          readonly [0]: {
            readonly type: TypeDefType.Record
            readonly keyPrototype: 'a' | 'b'
            readonly valueTypeDef:
              | {
                  readonly type: TypeDefType.Union
                  readonly discriminator: null
                  readonly unions: {
                    readonly [0]: {
                      readonly type: TypeDefType.Literal
                      readonly valuePrototype: [number]
                    }
                    readonly [1]: {
                      readonly type: TypeDefType.Literal
                      readonly valuePrototype: [null]
                    }
                  }
                }
              | undefined
          }
          readonly [1]: {
            readonly type: TypeDefType.Literal
            readonly valuePrototype: [null]
          }
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
      .readonlyField('b', stringType)
    type T = PartialTypeOfType<typeof builder._type>

    type C = {
      readonly typeDef: {
        readonly type: TypeDefType.Union
        readonly discriminator: null
        readonly unions: {
          readonly [0]: {
            readonly type: TypeDefType.Object
            readonly fields: {
              a?: {
                readonly type: TypeDefType.Union
                readonly discriminator: null
                readonly unions: {
                  readonly [0]: {
                    readonly type: TypeDefType.Literal
                    readonly valuePrototype: [number]
                  }
                  readonly [1]: {
                    readonly type: TypeDefType.Literal
                    readonly valuePrototype: [null]
                  }
                }
              }
              readonly b?: {
                readonly type: TypeDefType.Union
                readonly discriminator: null
                readonly unions: {
                  readonly [0]: {
                    readonly type: TypeDefType.Literal
                    readonly valuePrototype: [string]
                  }
                  readonly [1]: {
                    readonly type: TypeDefType.Literal
                    readonly valuePrototype: [null]
                  }
                }
              }
            }
          }
          readonly [1]: {
            readonly type: TypeDefType.Literal
            readonly valuePrototype: [null]
          }
        }
      }
    }

    it('equals expected type', () => {
      expectTypeOf<C>().toEqualTypeOf<T>()
    })
  })

  describe('union', () => {
    describe('simple', () => {
      const builder = union().or('1', numberType).or('2', stringType)
      type T = PartialTypeOfType<typeof builder._type>

      type C = {
        readonly typeDef: {
          readonly type: TypeDefType.Union
          readonly discriminator: null
          readonly unions: {
            readonly [0]: {
              readonly type: TypeDefType.Union
              readonly discriminator: null
              readonly unions: {
                readonly [1]: {
                  readonly type: TypeDefType.Literal
                  readonly valuePrototype: [number]
                }
                readonly [2]: {
                  readonly type: TypeDefType.Literal
                  readonly valuePrototype: [string]
                }
              }
            }
            readonly [1]: {
              readonly type: TypeDefType.Literal
              readonly valuePrototype: [null]
            }
          }
        }
      }

      it('equals expected type', () => {
        expectTypeOf<C>().toEqualTypeOf<T>()
      })
    })
  })

  describe('readonly', () => {
    const builder = list(numberType).readonly()
    type T = PartialTypeOfType<typeof builder._type>

    type C = {
      readonly typeDef: {
        readonly type: TypeDefType.Union
        readonly discriminator: null
        readonly unions: {
          readonly [0]: {
            readonly type: TypeDefType.List
            readonly elements: {
              readonly type: TypeDefType.Union
              readonly discriminator: null
              readonly unions: {
                readonly [0]: {
                  readonly type: TypeDefType.Literal
                  readonly valuePrototype: [number]
                }
                readonly [1]: {
                  readonly type: TypeDefType.Literal
                  readonly valuePrototype: [null]
                }
              }
            }
          }
          readonly [1]: {
            readonly type: TypeDefType.Literal
            readonly valuePrototype: [null]
          }
        }
      }
    }
    it('equals expected type', () => {
      expectTypeOf<C>().toEqualTypeOf<T>()
    })
  })
})

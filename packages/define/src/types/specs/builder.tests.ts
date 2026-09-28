import {
  booleanType,
  list,
  nullable,
  numberType,
  object,
  record,
  stringType,
  union,
} from 'types/builders'
import { TypeDefType } from 'types/Type'
import { type Rule } from 'types/ValidatingType'

describe('builder', () => {
  describe('literal', () => {
    const { definition } = numberType

    it('equals expected type', () => {
      type C = {
        readonly type: TypeDefType.Literal
        readonly valuePrototype: [number]
        readonly rule: Rule<never, {}>
        readonly required: boolean
        readonly readonly: boolean
      }

      expectTypeOf(definition).toEqualTypeOf<C>()
    })

    it('equals expected value', () => {
      expect(definition).toEqual({
        type: TypeDefType.Literal,
        valuePrototype: undefined,
        rule: expect.anything(),
        required: false,
        readonly: false,
      })
    })

    describe('nullable', () => {
      const { definition } = nullable(numberType)

      type C = {
        readonly type: TypeDefType.Union
        readonly discriminator: null
        readonly unions: {
          readonly [0]: {
            readonly type: TypeDefType.Literal
            readonly valuePrototype: [number]
            readonly rule: Rule<never, {}>
            readonly required: boolean
            readonly readonly: boolean
          }
          readonly [1]: {
            readonly type: TypeDefType.Literal
            readonly valuePrototype: [null]
            readonly rule: Rule<never, {}>
            readonly required: boolean
            readonly readonly: boolean
          }
        }
        readonly rule: Rule<never, {}>
        readonly required: boolean
        readonly readonly: boolean
      }

      it('equals expected type', () => {
        expectTypeOf(definition).toEqualTypeOf<C>()
      })
    })

    describe('required', () => {
      const { definition } = numberType.required()

      it('equals expected value', () => {
        expect(definition).toEqual({
          type: TypeDefType.Literal,
          valuePrototype: undefined,
          rule: expect.anything(),
          required: true,
          readonly: false,
        })
      })
    })

    describe('readonly', () => {
      const { definition } = numberType.readonly()

      it('equals expected value', () => {
        expect(definition).toEqual({
          type: TypeDefType.Literal,
          valuePrototype: undefined,
          rule: expect.anything(),
          required: false,
          readonly: true,
        })
      })
    })

    describe('readonly & required', () => {
      const { definition } = numberType.readonly().required()

      it('equals expected value', () => {
        expect(definition).toEqual({
          type: TypeDefType.Literal,
          valuePrototype: undefined,
          rule: expect.anything(),
          required: true,
          readonly: true,
        })
      })
    })
  })

  describe('list', () => {
    describe('numeric list', () => {
      describe('mutable', () => {
        const { definition: typeDef } = list(numberType)

        it('equals expected type', () => {
          type C = {
            readonly type: TypeDefType.List
            elements: {
              readonly type: TypeDefType.Literal
              readonly valuePrototype: [number]
              readonly rule: Rule<never, {}>
              readonly required: boolean
              readonly readonly: boolean
            }
            readonly rule: Rule<never, {}>
            readonly required: boolean
            readonly readonly: boolean
          }
          expectTypeOf(typeDef).toEqualTypeOf<C>()
        })
      })
    })

    describe('readonlyElements', () => {
      const { definition: typeDef } = list(numberType).readonlyElements()

      it('equals expected type', () => {
        type C = {
          readonly type: TypeDefType.List
          readonly elements: {
            readonly type: TypeDefType.Literal
            readonly valuePrototype: [number]
            readonly rule: Rule<never, {}>
            readonly required: boolean
            readonly readonly: boolean
          }
          readonly rule: Rule<never, {}>
          readonly required: boolean
          readonly readonly: boolean
        }

        expectTypeOf(typeDef).toEqualTypeOf<C>()
      })
    })
  })

  describe('record', () => {
    describe('numeric record', () => {
      describe('mutable', () => {
        const { definition: typeDef } = record<
          typeof numberType,
          'a' | 'b' | 'c'
        >(numberType)

        it('equals expected type', () => {
          type C = {
            readonly type: TypeDefType.Record
            readonly keyPrototype: 'a' | 'b' | 'c'
            valueTypeDef: {
              readonly type: TypeDefType.Literal
              readonly valuePrototype: [number]
              readonly rule: Rule<never, {}>
              readonly required: boolean
              readonly readonly: boolean
            }
            readonly rule: Rule<never, {}>
            readonly required: boolean
            readonly readonly: boolean
          }

          expectTypeOf(typeDef).toEqualTypeOf<C>()
        })
      })

      describe('readonly', () => {
        const { definition: typeDef } = record<
          typeof numberType,
          'a' | 'b' | 'c'
        >(numberType).readonlyKeys()

        it('equals expected type', () => {
          type C = {
            readonly type: TypeDefType.Record
            readonly keyPrototype: 'a' | 'b' | 'c'
            readonly valueTypeDef: {
              readonly type: TypeDefType.Literal
              readonly valuePrototype: [number]
              readonly rule: Rule<never, {}>
              readonly required: boolean
              readonly readonly: boolean
            }
            readonly rule: Rule<never, {}>
            readonly required: boolean
            readonly readonly: boolean
          }
          expectTypeOf(typeDef).toEqualTypeOf<C>()
        })
      })

      describe('partial', () => {
        const { definition: typeDef } = record<
          typeof numberType,
          'a' | 'b' | 'c'
        >(numberType).partialKeys()

        it('equals expected type', () => {
          type C = {
            readonly type: TypeDefType.Record
            readonly keyPrototype: 'a' | 'b' | 'c'
            valueTypeDef:
              | {
                  readonly type: TypeDefType.Literal
                  readonly valuePrototype: [number]
                  readonly rule: Rule<never, {}>
                  readonly required: boolean
                  readonly readonly: boolean
                }
              | undefined
            readonly rule: Rule<never, {}>
            readonly required: boolean
            readonly readonly: boolean
          }
          expectTypeOf(typeDef).toEqualTypeOf<C>()
        })
      })

      describe('partial and readonly', () => {
        const { definition: typeDef } = record<
          typeof numberType,
          'a' | 'b' | 'c'
        >(numberType)
          .partialKeys()
          .readonlyKeys()

        it('equals expected type', () => {
          type C = {
            readonly type: TypeDefType.Record
            readonly keyPrototype: 'a' | 'b' | 'c'
            readonly valueTypeDef:
              | {
                  readonly type: TypeDefType.Literal
                  readonly valuePrototype: [number]
                  readonly rule: Rule<never, {}>
                  readonly required: boolean
                  readonly readonly: boolean
                }
              | undefined
            readonly rule: Rule<never, {}>
            readonly required: boolean
            readonly readonly: boolean
          }

          expectTypeOf(typeDef).toEqualTypeOf<C>()
        })
      })

      describe('readonly and partial', () => {
        const { definition: typeDef } = record<
          typeof numberType,
          'a' | 'b' | 'c'
        >(numberType)
          .readonlyKeys()
          .partialKeys()

        it('equals expected type', () => {
          type C = {
            readonly type: TypeDefType.Record
            readonly keyPrototype: 'a' | 'b' | 'c'
            readonly valueTypeDef:
              | {
                  readonly type: TypeDefType.Literal
                  readonly valuePrototype: [number]
                  readonly rule: Rule<never, {}>
                  readonly required: boolean
                  readonly readonly: boolean
                }
              | undefined
            readonly rule: Rule<never, {}>
            readonly required: boolean
            readonly readonly: boolean
          }

          expectTypeOf(typeDef).toEqualTypeOf<C>()
        })
      })
    })
  })

  describe('object', () => {
    const { definition: typeDef } = object()
      .field('a', numberType)
      .readonlyField('b', booleanType)
      .optionalField('c', stringType)
      .readonlyOptionalField('d', numberType)

    it('equals expected type', () => {
      type C = {
        readonly type: TypeDefType.Object
        readonly fields: {
          a: {
            readonly type: TypeDefType.Literal
            readonly valuePrototype: [number]
            readonly rule: Rule<never, {}>
            readonly required: boolean
            readonly readonly: boolean
          }
        } & {
          readonly b: {
            readonly type: TypeDefType.Literal
            readonly valuePrototype: [boolean]
            readonly rule: Rule<never, {}>
            readonly required: boolean
            readonly readonly: boolean
          }
        } & {
          c?: {
            readonly type: TypeDefType.Literal
            readonly valuePrototype: [string]
            readonly rule: Rule<never, {}>
            readonly required: boolean
            readonly readonly: boolean
          }
        } & {
          readonly d?: {
            readonly type: TypeDefType.Literal
            readonly valuePrototype: [number]
            readonly rule: Rule<never, {}>
            readonly required: boolean
            readonly readonly: boolean
          }
        }
        readonly rule: Rule<never, {}>
        readonly required: boolean
        readonly readonly: boolean
      }

      expectTypeOf(typeDef).toEqualTypeOf<C>()
    })
  })

  describe('union', () => {
    describe('literals', () => {
      const { definition: typeDef } = union()
        .or('1', numberType)
        .or('2', stringType)

      it('equals expected type', () => {
        type C = {
          readonly type: TypeDefType.Union
          readonly discriminator: null
          readonly unions: {
            readonly [1]: {
              readonly type: TypeDefType.Literal
              readonly valuePrototype: [number]
              readonly rule: Rule<never, {}>
              readonly required: boolean
              readonly readonly: boolean
            }
          } & {
            readonly [2]: {
              readonly type: TypeDefType.Literal
              readonly valuePrototype: [string]
              readonly rule: Rule<never, {}>
              readonly required: boolean
              readonly readonly: boolean
            }
          }
          readonly rule: Rule<never, {}>
          readonly required: boolean
          readonly readonly: boolean
        }
        expectTypeOf(typeDef).toEqualTypeOf<C>()
      })
    })

    describe('objects', () => {
      describe('mutable', () => {
        const { definition: typeDef } = union()
          .or('1', object().field('a', booleanType))
          .or('2', object().field('b', numberType))

        it('equals expected type', () => {
          type C = {
            readonly type: TypeDefType.Union
            readonly discriminator: null
            readonly unions: {
              readonly [1]: {
                readonly type: TypeDefType.Object
                readonly fields: {
                  a: {
                    readonly type: TypeDefType.Literal
                    readonly valuePrototype: [boolean]
                    readonly rule: Rule<never, {}>
                    readonly required: boolean
                    readonly readonly: boolean
                  }
                }
                readonly rule: Rule<never, {}>
                readonly required: boolean
                readonly readonly: boolean
              }
            } & {
              readonly [2]: {
                readonly type: TypeDefType.Object
                readonly fields: {
                  b: {
                    readonly type: TypeDefType.Literal
                    readonly valuePrototype: [number]
                    readonly rule: Rule<never, {}>
                    readonly required: boolean
                    readonly readonly: boolean
                  }
                }
                readonly rule: Rule<never, {}>
                readonly required: boolean
                readonly readonly: boolean
              }
            }
            readonly rule: Rule<never, {}>
            readonly required: boolean
            readonly readonly: boolean
          }
          expectTypeOf(typeDef).toEqualTypeOf<C>()
        })
      })
    })
  })
})

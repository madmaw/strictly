import { list, numberType } from 'types/builders'
import { type TypeDefType } from 'types/Type'
import { type TypeOfType } from 'types/typeOfType'

describe('TypeOfType', () => {
  describe('literal', () => {
    const literalType = numberType
    type T = TypeOfType<typeof literalType>
    type C = {
      readonly definition: {
        readonly type: TypeDefType.Literal
        readonly valuePrototype: [number]
      }
    }

    it('equals expected type', () => {
      expectTypeOf<T>().toEqualTypeOf<C>()
    })
  })

  describe('list', () => {
    describe('mutable', () => {
      const listType = list(numberType)
      type T = TypeOfType<typeof listType>
      type C = {
        readonly definition: {
          readonly type: TypeDefType.List
          elements: {
            readonly type: TypeDefType.Literal
            readonly valuePrototype: [number]
          }
        }
      }
      it('equals expected type', () => {
        expectTypeOf<T>().toEqualTypeOf<C>()
      })
    })
    describe('readonly', () => {
      const listType = list(numberType).readonlyElements()
      type T = TypeOfType<typeof listType>
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
        expectTypeOf<T>().toEqualTypeOf<C>()
      })
    })
  })

  // TODO other types
})

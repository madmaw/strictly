import {
  list,
  numberType,
} from 'types/builders'
import { type TypeDefType } from 'types/definitions'
import { type TypeOfType } from 'types/type_of_type'

describe('TypeOfType', function () {
  describe('literal', function () {
    const literalType = numberType
    type T = TypeOfType<typeof literalType>
    let t: {
      readonly definition: {
        readonly type: TypeDefType.Literal,
        readonly valuePrototype: [number],
      },
    }

    it('equals expected type', function () {
      expectTypeOf<T>().toEqualTypeOf(t)
    })
  })

  describe('list', function () {
    describe('mutable', function () {
      const listType = list(numberType)
      type T = TypeOfType<typeof listType>
      let t: {
        readonly definition: {
          readonly type: TypeDefType.List,
          elements: {
            readonly type: TypeDefType.Literal,
            readonly valuePrototype: [number],
          },
        },
      }
      it('equals expected type', function () {
        expectTypeOf<T>().toEqualTypeOf(t)
      })
    })
    describe('readonly', function () {
      const listType = list(numberType).readonly()
      type T = TypeOfType<typeof listType>
      let t: {
        readonly definition: {
          readonly type: TypeDefType.List,
          readonly elements: {
            readonly type: TypeDefType.Literal,
            readonly valuePrototype: [number],
          },
        },
      }
      it('equals expected type', function () {
        expectTypeOf<T>().toEqualTypeOf(t)
      })
    })
  })

  // TODO other types
})

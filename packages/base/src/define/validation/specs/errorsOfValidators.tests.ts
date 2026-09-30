import { type ErrorsOfValidators } from 'define/validation/ErrorsOfValidators'
import { type Validator } from 'define/validation/validator'

describe('ErrorsOfValidators', () => {
  describe('simple', () => {
    type T = ErrorsOfValidators<{
      x: Validator<string, 'a'>
      y: Validator<number, 'b'>
    }>

    type C = {
      readonly x: 'a'
      readonly y: 'b'
    }

    it('equals expected type', () => {
      expectTypeOf<T>().toEqualTypeOf<C>()
    })
  })
})

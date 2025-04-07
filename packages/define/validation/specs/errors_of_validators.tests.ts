import { type ErrorsOfValidators } from 'validation/errors_of_validators'
import { type Validator } from 'validation/validator'

describe('ErrorsOfValidators', function () {
  describe('simple', function () {
    type T = ErrorsOfValidators<{
      x: Validator<string, 'a'>,
      y: Validator<number, 'b'>,
    }>

    type C = {
      readonly x: 'a',
      readonly y: 'b',
    }

    it('equals expected type', function () {
      expectTypeOf<T>().toEqualTypeOf<C>()
    })
  })
})

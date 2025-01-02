import { type ValidationsOfValidators } from 'validation/validations_of_validators'
import { type Validator } from 'validation/validator'

describe('ValidationsOfValidators', function () {
  describe('simple', function () {
    type T = ValidationsOfValidators<{
      x: Validator<string, 'a'>,
      y: Validator<number, 'b'>,
    }>

    let t: {
      readonly x: 'a',
      readonly y: 'b',
    }

    it('equals expected type', function () {
      expectTypeOf<T>().toEqualTypeOf(t)
    })
  })
})

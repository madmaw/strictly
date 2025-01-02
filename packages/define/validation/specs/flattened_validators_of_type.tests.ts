import { literal } from 'types/builders'
import { type FlattenedValidatorsOfType } from 'validation/flattened_validators_of_type'
import { type Validator } from 'validation/validator'

describe('FlattenedValidatorsOfType', function () {
  describe('literal', function () {
    const type = literal<'a' | 'b' | 'c'>()

    type T = FlattenedValidatorsOfType<typeof type>

    let t: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      readonly $: Validator<'a' | 'b' | 'c', any>,
    }

    it('has the expected type', function () {
      expectTypeOf<T>().toEqualTypeOf(t)
    })
  })
})

import { type Validator } from 'validation/validator'
import { type ValidatorsOfValues } from 'validation/validators_of_values'

describe('FlattenedValidatorsOfType', function () {
  describe('literal', function () {
    type T = ValidatorsOfValues<
      {
        $: 'a' | 'b' | 'c',
      },
      {
        $: '$',
      },
      1
    >

    type C = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      readonly $: Validator<'a' | 'b' | 'c', any, '$', 1>,
    }

    it('has the expected type', function () {
      expectTypeOf<T>().toEqualTypeOf<C>()
    })
  })

  describe('list', function () {
    type T = ValidatorsOfValues<
      {
        $: number[],
        '$.*': number,
      },
      {
        $: '$',
        '$.*': `$.${number}`,
      },
      2
    >

    type C = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      readonly $: Validator<number[], any, '$', 2>,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      readonly '$.*': Validator<number, any, `$.${number}`, 2>,
    }

    it('has the expected type', function () {
      expectTypeOf<T>().toEqualTypeOf<C>()
    })
  })

  describe('with defaults', function () {
    type T = ValidatorsOfValues<
      {
        $: number[],
        '$.*': number,
      }
    >

    type C = {
      readonly $: Validator<number[]>,
      readonly '$.*': Validator<number>,
    }

    it('has the expected type', function () {
      expectTypeOf<T>().toEqualTypeOf<C>()
    })
  })
})

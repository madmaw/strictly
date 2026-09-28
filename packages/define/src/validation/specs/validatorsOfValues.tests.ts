import { type Validator } from 'validation/validator'
import { type ValidatorsOfValues } from 'validation/ValidatorsOfValues'

describe('FlattenedValidatorsOfType', () => {
  describe('literal', () => {
    type T = ValidatorsOfValues<
      {
        $: 'a' | 'b' | 'c'
      },
      {
        $: '$'
      },
      1
    >

    type C = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      readonly $: Validator<'a' | 'b' | 'c', any, '$', 1>
    }

    it('has the expected type', () => {
      expectTypeOf<T>().toEqualTypeOf<C>()
    })
  })

  describe('list', () => {
    type T = ValidatorsOfValues<
      {
        $: number[]
        '$.*': number
      },
      {
        $: '$'
        '$.*': `$.${number}`
      },
      2
    >

    type C = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      readonly $: Validator<number[], any, '$', 2>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      readonly '$.*': Validator<number, any, `$.${number}`, 2>
    }

    it('has the expected type', () => {
      expectTypeOf<T>().toEqualTypeOf<C>()
    })
  })

  describe('with defaults', () => {
    type T = ValidatorsOfValues<{
      $: number[]
      '$.*': number
    }>

    type C = {
      readonly $: Validator<number[]>
      readonly '$.*': Validator<number>
    }

    it('has the expected type', () => {
      expectTypeOf<T>().toEqualTypeOf<C>()
    })
  })
})

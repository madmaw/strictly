import { numberType, object, record, stringType } from 'types/builders'
import { type FlattenedValuesOfType } from 'types/FlattenedValuesOfType'

describe('FlattenedValuesOfType', () => {
  // note we only test a small example since most of the work is done in flatten
  describe('record', () => {
    const builder = record<typeof numberType, string>(numberType)
    type V = FlattenedValuesOfType<typeof builder.narrow>

    type C = {
      readonly $: Record<string, number>
      readonly [_: `$.${string}`]: number
    }
    it('equals expected type', () => {
      expectTypeOf<C>().toEqualTypeOf<V>()
    })
  })

  describe('object', () => {
    const builder = object().optionalField('a', stringType)
    type V = FlattenedValuesOfType<typeof builder>

    type C = {
      readonly $: {
        a?: string | undefined
      }
      readonly '$.a': string | undefined
    }

    it('equals expected type', () => {
      expectTypeOf<C>().toEqualTypeOf<V>()
    })
  })
})

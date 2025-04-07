import {
  numberType,
  object,
  record,
  stringType,
} from 'types/builders'
import { type FlattenedValuesOfType } from 'types/flattened_values_of_type'

describe('FlattenedValuesOfType', function () {
  // note we only test a small example since most of the work is done in flatten
  describe('record', function () {
    const builder = record<typeof numberType, string>(numberType)
    type V = FlattenedValuesOfType<typeof builder.narrow>

    type C = {
      readonly $: Record<string, number>,
      readonly [_: `$.${string}`]: number,
    }
    it('equals expected type', function () {
      expectTypeOf<C>().toEqualTypeOf<V>()
    })
  })

  describe('object', function () {
    const builder = object().optionalField('a', stringType)
    type V = FlattenedValuesOfType<typeof builder>

    type C = {
      readonly $: {
        a?: string | undefined,
      },
      readonly '$.a': string | undefined,
    }

    it('equals expected type', function () {
      expectTypeOf<C>().toEqualTypeOf<V>()
    })
  })
})

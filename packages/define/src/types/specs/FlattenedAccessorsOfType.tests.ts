import { numberType, object, record, stringType } from 'types/builders'
import { type FlattenedAccessorsOfType } from 'types/FlattenedAccessorsOfType'

describe('FlattenedAccessorsOfType', () => {
  // note we only test a small example since most of the work is done in flatten
  describe('record', () => {
    const t = record<typeof numberType, string>(numberType).narrow
    type V = FlattenedAccessorsOfType<typeof t>

    type C = {
      readonly $: {
        readonly value: Record<string, number>
        set: (v: Record<string, number>) => void
      }
      readonly [_: `$.${string}`]: {
        readonly value: number
        set: (v: number) => void
      }
    }
    it('equals expected type', () => {
      expectTypeOf<C>().toEqualTypeOf<V>()
    })
  })

  describe('object', () => {
    const t = object().optionalField('a', stringType).narrow
    type V = FlattenedAccessorsOfType<typeof t>

    type C = {
      readonly $: {
        readonly value: {
          a?: string | undefined
        }
        set: (v: { a?: string | undefined }) => void
      }
      readonly '$.a': {
        readonly value: string | undefined
        set: (v: string | undefined) => void
      }
    }
    it('equals expected type', () => {
      expectTypeOf<C>().toEqualTypeOf<V>()
    })
  })
})

import { numberType, record } from 'types/builders'
import { type FlattenedAccessorsOfType } from 'types/FlattenedAccessorsOfType'

describe('FlattenedAccessorsOfType', () => {
  // note we only test a small example since most of the work is done in flatten
  describe('record', () => {
    const builder = record<typeof numberType, string>(numberType)
    type V = FlattenedAccessorsOfType<typeof builder>

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
})

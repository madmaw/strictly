import { expectDefinedAndReturn } from '@strictly/base'
import { flattenAccessorsOfType } from 'transformers/flatteners/flattenAccessorsOfType'
import { booleanType, list, numberType, object } from 'types/builders'
import { type FlattenedAccessorsOfType } from 'types/FlattenedAccessorsOfType'
import { type ValueOfType } from 'types/ValueOfType'
import { type Mock, vi } from 'vite-plus/test'

describe('flattenAccessorsOfType', () => {
  let setter: Mock
  const type = object()
    .field('a', list(numberType))
    .field('b', booleanType).narrow

  let flattened: FlattenedAccessorsOfType<typeof type>
  let value: ValueOfType<typeof type>

  beforeEach(() => {
    setter = vi.fn()
    value = {
      a: [1, 2, 4],
      b: false,
    }
    flattened = flattenAccessorsOfType<typeof type>(type, value, setter)
  })

  // note that we already have tests for the type and the function that this calls, so
  // this is only a sanity check
  it('flattens to expected type', () => {
    expect(flattened).toEqual({
      $: {
        value: {
          a: [1, 2, 4],
          b: false,
        },
        set: setter,
      },
      '$.a': expect.objectContaining({
        value: [1, 2, 4],
      }),
      '$.a.0': expect.objectContaining({
        value: 1,
      }),
      '$.a.1': expect.objectContaining({
        value: 2,
      }),
      '$.a.2': expect.objectContaining({
        value: 4,
      }),
      '$.b': expect.objectContaining({
        value: false,
      }),
    })
  })

  it('sets an internal value of a struct', () => {
    expectDefinedAndReturn(flattened['$.a']).set([5])

    expect(value).toEqual({
      a: [5],
      b: false,
    })
  })

  it('sets an internal value of an array', () => {
    expectDefinedAndReturn(flattened['$.a.1']).set(99)

    expect(value).toEqual({
      a: [1, 99, 4],
      b: false,
    })
  })

  it('sets the top level value', () => {
    const newValue: ValueOfType<typeof type> = {
      a: [-1, 5],
      b: true,
    }
    expectDefinedAndReturn(flattened.$).set(newValue)
    expect(setter).toHaveBeenCalledWith(newValue)
  })
})

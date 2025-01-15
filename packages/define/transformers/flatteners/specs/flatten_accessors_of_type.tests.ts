import { expectDefinedAndReturn } from '@strictly/base'
import { flattenAccessorsOfType } from 'transformers/flatteners/flatten_accessors_of_type'
import {
  booleanType,
  list,
  numberType,
  object,
} from 'types/builders'
import { type FlattenedAccessorsOfType } from 'types/flattened_accessors_of_type'
import { type ValueOfType } from 'types/value_of_type'
import {
  type Mock,
  vi,
} from 'vitest'

describe('flattenAccessorsOfType', function () {
  let setter: Mock
  const builder = object()
    .field('a', list(numberType))
    .field('b', booleanType)

  let flattened: FlattenedAccessorsOfType<typeof builder>
  let value: ValueOfType<typeof builder>

  beforeEach(function () {
    setter = vi.fn()
    value = {
      a: [
        1,
        2,
        4,
      ],
      b: false,
    }
    flattened = flattenAccessorsOfType<typeof builder>(
      builder,
      value,
      setter,
    )
  })

  // note that we already have tests for the type and the function that this calls, so
  // this is only a sanity check
  it('flattens to expected type', function () {
    expect(flattened).toEqual({
      $: {
        value: {
          a: [
            1,
            2,
            4,
          ],
          b: false,
        },
        set: setter,
      },
      '$.a': expect.objectContaining({
        value: [
          1,
          2,
          4,
        ],
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

  it('sets an internal value of a struct', function () {
    expectDefinedAndReturn(flattened['$.a']).set([5])

    expect(value).toEqual({
      a: [5],
      b: false,
    })
  })

  it('sets an internal value of an array', function () {
    expectDefinedAndReturn(flattened['$.a.1']).set(99)

    expect(value).toEqual({
      a: [
        1,
        99,
        4,
      ],
      b: false,
    })
  })

  it('sets the top level value', function () {
    const newValue: ValueOfType<typeof builder> = {
      a: [
        -1,
        5,
      ],
      b: true,
    }
    expectDefinedAndReturn(flattened.$).set(newValue)
    expect(setter).toHaveBeenCalledWith(newValue)
  })
})

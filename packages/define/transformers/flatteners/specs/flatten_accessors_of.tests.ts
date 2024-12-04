import { expectDefinedAndReturn } from '@de/base/test'
import { flattenAccessorsOf } from 'transformers/flatteners/flatten_accessors_of'
import {
  boolean,
  list,
  number,
  struct,
} from 'types/builders'
import { type FlattenedAccessorsOf } from 'types/flattened_accessors_of'
import { type ValueTypeOf } from 'types/value_type_of'
import {
  type Mock,
  vi,
} from 'vitest'

describe('flattenAccessorsOf', function () {
  let setter: Mock
  const builder = struct()
    .set('a', list(number))
    .set('b', boolean)
    .narrow

  let flattened: FlattenedAccessorsOf<typeof builder>
  let value: ValueTypeOf<typeof builder>

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
    flattened = flattenAccessorsOf<typeof builder>(
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
    const newValue: ValueTypeOf<typeof builder> = {
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

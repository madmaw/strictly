import { flattenValueTypesOf } from 'transformers/flatteners/flatten_value_types_of'
import {
  booleanType,
  list,
  numberType,
  object,
} from 'types/builders'

describe('flattenValueTypesOf', function () {
  // note that we already have tests for the type and the function that this calls, so
  // this is only a sanity check
  it('flattens', function () {
    const flattened = flattenValueTypesOf(
      object()
        .set('a', list(numberType))
        .set('b', booleanType),
      {
        a: [
          1,
          2,
          4,
        ],
        b: false,
      },
    )
    expect(flattened).toEqual({
      $: {
        a: [
          1,
          2,
          4,
        ],
        b: false,
      },
      '$.a': [
        1,
        2,
        4,
      ],
      '$.a.0': 1,
      '$.a.1': 2,
      '$.a.2': 4,
      '$.b': false,
    })
  })
})

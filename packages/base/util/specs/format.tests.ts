import { format } from 'util/format'

describe('format', function () {
  it.each(
    [
      [
        'no args',
        'message',
        'message',
      ],
      [
        'one anonymous arg',
        'arg {}',
        'arg 1',
        1,
      ],
      [
        'one indexed arg',
        'arg {0}',
        'arg "0"',
        '0',
      ],
      [
        'two args',
        'args {}, {}',
        'args 1, 2',
        1,
        2,
      ],
      [
        'two indexed args',
        'args {0}, {1}',
        'args 1, 2',
        1,
        2,
      ],
      [
        'two indexed args, reversed',
        'args {1}, {0}',
        'args 2, 1',
        1,
        2,
      ],
      [
        'null',
        'null? {}',
        'null? null',
        null,
      ],
      [
        'mixed argument types',
        '{} {} {} {}',
        '1 "2" true -5',
        1,
        '2',
        true,
        -5,
      ],
      [
        'object',
        '{}',
        '{"b":true}',
        { b: true },
      ],
    ] as const,
  )('formats %s', function (_name, message, expectedResult, ...args) {
    const result = format(message, ...args)
    expect(result).toEqual(expectedResult)
  })
})

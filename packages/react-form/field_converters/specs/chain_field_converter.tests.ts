import {
  chainAnnotatedFieldConverter,
  chainUnreliableFieldConverter,
} from 'field_converters/chain_field_converter'
import {
  type AnnotatedFieldConversion,
  type AnnotatedFieldConverter,
  type UnreliableFieldConversion,
  UnreliableFieldConversionType,
  type UnreliableFieldConverter,
} from 'types/field_converters'
import { type Mock } from 'vitest'

const CONTEXT = 'ctx'
const ERROR1 = 'error 1'
const ERROR2 = 'error 2'

describe('chainUnreliableFieldConverter', function () {
  const from: Mock<UnreliableFieldConverter<number, boolean, typeof ERROR1, 'x', typeof CONTEXT>> = vi.fn()
  const to: Mock<UnreliableFieldConverter<boolean, string, typeof ERROR2, 'x', typeof CONTEXT>> = vi.fn()

  let chained: UnreliableFieldConverter<number, string, typeof ERROR1 | typeof ERROR2, 'x', typeof CONTEXT>
  let result: UnreliableFieldConversion<string, typeof ERROR1 | typeof ERROR2>

  beforeEach(function () {
    from.mockReset()
    to.mockReset()

    chained = chainUnreliableFieldConverter(from, to)
  })
  describe('from succeeds', function () {
    beforeEach(function () {
      from.mockReturnValue({
        type: UnreliableFieldConversionType.Success,
        value: true,
      })
    })

    describe('to succeeds', function () {
      beforeEach(function () {
        to.mockReturnValue({
          type: UnreliableFieldConversionType.Success,
          value: 'x',
        })
        result = chained(1, 'x', CONTEXT)
      })

      it('equals expected type', function () {
        expect(result).toEqual({
          type: UnreliableFieldConversionType.Success,
          value: 'x',
        })
      })

      it('has the original value passed to the from converter', function () {
        expect(from).toHaveBeenCalledOnce()
        expect(from).toHaveBeenCalledWith(1, 'x', CONTEXT)
      })

      it('has passed the from result to the to converter', function () {
        expect(to).toHaveBeenCalledOnce()
        expect(to).toHaveBeenCalledWith(true, 'x', CONTEXT)
      })
    })

    describe('to fails with result', function () {
      beforeEach(function () {
        to.mockReturnValue({
          type: UnreliableFieldConversionType.Failure,
          value: ['y'],
          error: ERROR2,
        })
        result = chained(1, 'x', CONTEXT)
      })

      it('equals expected type', function () {
        expect(result).toEqual({
          type: UnreliableFieldConversionType.Failure,
          value: ['y'],
          error: ERROR2,
        })
      })
    })
  })

  describe('from fails with a value', function () {
    beforeEach(function () {
      from.mockReturnValue({
        type: UnreliableFieldConversionType.Failure,
        value: [true],
        error: ERROR1,
      })
    })

    describe('to succeeds', function () {
      beforeEach(function () {
        to.mockReturnValue({
          type: UnreliableFieldConversionType.Success,
          value: 'x',
        })
        result = chained(1, 'x', CONTEXT)
      })

      it('equals expected type', function () {
        expect(result).toEqual({
          type: UnreliableFieldConversionType.Failure,
          value: ['x'],
          error: ERROR1,
        })
      })

      it('has the original value passed to the from converter', function () {
        expect(from).toHaveBeenCalledOnce()
        expect(from).toHaveBeenCalledWith(1, 'x', CONTEXT)
      })

      it('passes the failure result to the to converter', function () {
        expect(to).toHaveBeenCalledOnce()
        expect(to).toHaveBeenCalledWith(true, 'x', CONTEXT)
      })
    })

    describe('to fails', function () {
      beforeEach(function () {
        to.mockReturnValue({
          type: UnreliableFieldConversionType.Failure,
          value: ['x'],
          error: ERROR2,
        })
        result = chained(1, 'x', CONTEXT)
      })

      it('equals expected type', function () {
        expect(result).toEqual({
          type: UnreliableFieldConversionType.Failure,
          value: ['x'],
          error: ERROR1,
        })
      })
    })
  })

  describe('from fails with no value', function () {
    beforeEach(function () {
      from.mockReturnValue({
        type: UnreliableFieldConversionType.Failure,
        value: null,
        error: ERROR1,
      })
      result = chained(1, 'x', CONTEXT)
    })

    it('equals expected type', function () {
      expect(result).toEqual({
        type: UnreliableFieldConversionType.Failure,
        value: null,
        error: ERROR1,
      })
    })

    it('does not call to converter', function () {
      expect(to).not.toHaveBeenCalled()
    })
  })
})

describe('chainAnnotatedFieldConverter', function () {
  const from: Mock<AnnotatedFieldConverter<string, boolean, 'x', typeof CONTEXT>> = vi.fn()
  const to: Mock<AnnotatedFieldConverter<boolean, number, 'x', typeof CONTEXT>> = vi.fn()

  let chained: AnnotatedFieldConverter<string, number, 'x', typeof CONTEXT>
  let result: AnnotatedFieldConversion<number>

  beforeEach(function () {
    from.mockReset()
    to.mockReset()

    chained = chainAnnotatedFieldConverter(from, to)
  })

  describe('value', function () {
    beforeEach(function () {
      from.mockReturnValue({
        value: true,
        disabled: false,
        required: false,
      })
      to.mockReturnValue({
        value: 1,
        disabled: false,
        required: false,
      })
      result = chained('z', 'x', CONTEXT)
    })

    it('returns expected value', function () {
      expect(result).toEqual(
        expect.objectContaining({
          value: 1,
        }),
      )
    })

    it('calls the from converter', function () {
      expect(from).toHaveBeenCalledOnce()
      expect(from).toHaveBeenCalledWith('z', 'x', CONTEXT)
    })

    it('calls the to converter', function () {
      expect(to).toHaveBeenCalledOnce()
      expect(to).toHaveBeenCalledWith(true, 'x', CONTEXT)
    })
  })

  describe.each([
    [
      true,
      true,
      true,
    ],
    [
      true,
      false,
      true,
    ],
    [
      false,
      true,
      true,
    ],
    [
      false,
      false,
      false,
    ],
  ] as const)(
    'from required %s to required %s result %s',
    function (fromRequired, toRequired, required) {
      beforeEach(function () {
        from.mockReturnValue({
          value: true,
          disabled: false,
          required: fromRequired,
        })
        to.mockReturnValue({
          value: 1,
          disabled: false,
          required: toRequired,
        })
        result = chained('z', 'x', CONTEXT)
      })

      it('required matches expected', function () {
        expect(result.required).toEqual(required)
      })
    },
  )

  describe.each([
    [
      true,
      true,
      true,
    ],
    [
      true,
      false,
      true,
    ],
    [
      false,
      true,
      true,
    ],
    [
      false,
      false,
      false,
    ],
  ] as const)(
    'from disabled %s to disabled %s result %s',
    function (fromDisabled, toDisabled, disabled) {
      beforeEach(function () {
        from.mockReturnValue({
          value: true,
          disabled: fromDisabled,
          required: false,
        })
        to.mockReturnValue({
          value: 1,
          disabled: toDisabled,
          required: false,
        })
        result = chained('z', 'x', CONTEXT)
      })

      it('required matches expected', function () {
        expect(result.disabled).toEqual(disabled)
      })
    },
  )
})

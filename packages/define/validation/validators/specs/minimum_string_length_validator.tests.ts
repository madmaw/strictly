import {
  MinimumStringLengthValidationErrorType,
  MinimumStringLengthValidator,
} from 'validation/validators/minimum_string_length_validator'

describe('MinimumStringLengthValidator', () => {
  describe('required', () => {
    it.each([
      1,
      2,
      100,
    ])('is required when the string length is %s', (minimumLength) => {
      const validator = new MinimumStringLengthValidator(minimumLength)
      expect(validator.annotations().required).toBeTruthy()
    })

    it('is not required when the string length is zero', () => {
      const validator = new MinimumStringLengthValidator(0)
      expect(validator.annotations().required).toBeFalsy()
    })
  })

  describe('validation', () => {
    it.each([
      [
        1,
        'a',
      ],
      [
        2,
        'asdf',
      ],
      [
        0,
        '',
      ],
      [
        20,
        '12345678901234567890',
      ],
    ])('passes validation with minimum length %s and value "%s"', (minimumLength, value) => {
      const validator = new MinimumStringLengthValidator(minimumLength)
      expect(validator.validate(value)).toBeNull()
    })

    it.each([
      [
        1,
        '',
        0,
      ],
      [
        2,
        'a',
        1,
      ],
      [
        20,
        '1234567890123456789',
        19,
      ],
      [
        100,
        '',
        0,
      ],
    ])('fails validation with minimum length %s and value "%s', (minimumLength, value, receivedLength) => {
      const validator = new MinimumStringLengthValidator(minimumLength)
      expect(validator.validate(value)).toEqual({
        type: MinimumStringLengthValidationErrorType,
        minimumLength,
        receivedLength,
      })
    })
  })
})

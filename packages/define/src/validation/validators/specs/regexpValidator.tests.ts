import {
  RegexpValidationErrorType,
  RegexpValidator,
} from 'validation/validators/RegexpValidator'

describe('RegexpValidator', () => {
  describe('phone', () => {
    it.each([
      '0403545000',
      '+12 (1800) 000 000',
      '1-2-3-4-5-6',
      '+1 394 3234 000 (2)',
      '1234',
    ])('accepts "%s"', (phoneNumber) => {
      expect(RegexpValidator.phone.validate(phoneNumber)).toBeNull()
    })

    it.each([
      '',
      'ABC',
      '1',
      ' 0412345678',
      '----1245456',
      '1      2',
      '234234+234',
    ])('rejects "%s"', (phoneNumber) => {
      expect(RegexpValidator.phone.validate(phoneNumber)).toEqual({
        type: RegexpValidationErrorType,
        intent: 'phone',
      })
    })
  })

  describe('email', () => {
    it.each([
      'x@y.z',
      'support@company.com',
      '...@......',
      '1234@3454.23',
    ])('accepts "%s"', (email) => {
      expect(RegexpValidator.email.validate(email)).toBeNull()
    })

    it.each([
      '',
      '@@@@',
      'email',
      '@bee.com',
      'aaa@bbb',
      'a a@b b.c c',
    ])('rejects "%s"', (email) => {
      expect(RegexpValidator.email.validate(email)).toEqual({
        type: RegexpValidationErrorType,
        intent: 'email',
      })
    })
  })

  describe('required', () => {
    it.each([
      true,
      false,
    ])('exposes required %s', (required) => {
      const validator = new RegexpValidator(/a/, 'test', {
        required,
      })
      expect(validator.annotations().required).toBe(required)
    })
  })

  describe('general', () => {
    // not here to test if regexp works
    it.each([
      [
        '^a$',
        'a',
      ],
      [
        '^\\w+$',
        'asdf',
      ],
    ])('passes validation with regexp "%s" and value "%s"', (regexpString, value) => {
      const regexp = new RegExp(regexpString)
      const validator = new RegexpValidator(regexp, 'test')
      expect(validator.validate(value)).toBeNull()
    })

    it.each([
      [
        '^$',
        'something',
        'empty',
      ],
      [
        '^\\w+$',
        '',
        'non-empty',
      ],
    ])('fails validation with regexp "%s" and value "%s', (regexpString, value, intent) => {
      const regexp = new RegExp(regexpString)
      const validator = new RegexpValidator(regexp, intent)
      expect(validator.validate(value)).toEqual({
        type: RegexpValidationErrorType,
        intent,
      })
    })
  })
})

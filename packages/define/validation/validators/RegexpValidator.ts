import {
  type AnnotatedValidator,
} from 'validation/validator'

export const RegexpValidationErrorType = 'regexp'

export type RegexpValidationError<Intent extends string> = {
  type: typeof RegexpValidationErrorType,
  intent: Intent,
}

export class RegexpValidator<Intent extends string>
  implements AnnotatedValidator<string, RegexpValidationError<Intent>, never, never>
{
  /**
   * Extremely permissive email validator
   */
  static readonly email = new RegexpValidator(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'email')

  /**
   * Extremely permissive phone number validator
   */
  static readonly phone = new RegexpValidator(/^(\+\d{1,4}[\s]*)?(((\([\d\s-]{1,6}\))|\d)[\s-]*){3,14}(\d|(\(\d+\)))$/,
    'phone')

  private readonly negate: boolean
  private readonly required: boolean

  constructor(
    private readonly regexp: RegExp,
    private readonly intent: Intent,
    {
      negate = false,
      required = false,
    }: {
      negate?: boolean,
      required?: boolean,
    } = {},
  ) {
    this.negate = negate
    this.required = required
  }

  validate(value: string): RegexpValidationError<Intent> | null {
    const passes = this.regexp.test(value)
    if (!passes && !this.negate || passes && this.negate) {
      return {
        type: RegexpValidationErrorType,
        intent: this.intent,
      }
    }
    return null
  }

  annotations() {
    return {
      required: this.required,
      readonly: false,
    }
  }
}

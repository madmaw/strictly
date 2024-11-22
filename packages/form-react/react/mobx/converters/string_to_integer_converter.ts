import {
  type Conversion,
  ConversionResult,
  type Converter,
} from 'react/mobx/form_presenter'
import { type FormField } from 'types/form_field'

export class StringToIntegerConverter<E> implements Converter<E, Record<string, FormField>, number, string> {
  constructor(private readonly isNanError: E) {
  }

  convert(from: string): Conversion<E, number> {
    const value = parseInt(from, 10)
    if (Number.isNaN(value)) {
      return {
        type: ConversionResult.Failure,
        error: this.isNanError,
      }
    } else {
      return {
        type: ConversionResult.Success,
        value,
      }
    }
  }
  revert(to: number): string {
    return Math.floor(to).toString()
  }
}

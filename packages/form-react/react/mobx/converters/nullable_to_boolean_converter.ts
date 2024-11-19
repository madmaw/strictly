import {
  type Conversion,
  ConversionResult,
  type Converter,
} from 'react/mobx/form_presenter'
import { type FormField } from 'react/props'

export class NullableToBooleanConverter<E, T> implements Converter<E, Record<string, FormField>, T | null, boolean> {
  constructor(private readonly prototype: T) {
  }

  convert(from: boolean): Conversion<E, T | null> {
    return {
      type: ConversionResult.Success,
      value: from ? this.prototype : null,
    }
  }

  revert(to: T | null): boolean {
    return to != null
  }
}

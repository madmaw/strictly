import {
  type Conversion,
  ConversionResult,
  type Converter,
} from 'react/mobx/form_presenter'
import { type FormField } from 'types/form_field'

export class PassThroughConverter<E, V> implements Converter<E, Record<string, FormField>, V, V> {
  convert(from: V): Conversion<E, V> {
    return {
      type: ConversionResult.Success,
      value: from,
    }
  }

  revert(to: V): V {
    return to
  }
}

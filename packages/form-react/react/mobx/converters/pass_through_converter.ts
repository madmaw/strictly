import {
  type Conversion,
  ConversionResult,
  type Converter,
} from 'react/mobx/form_presenter'

export class PassThroughConverter<E, V> implements Converter<E, V, V> {
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

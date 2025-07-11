import { map } from '@strictly/base'
import {
  chainAnnotatedFieldConverter,
  chainUnreliableFieldConverter,
} from 'field_converters/chainFieldConverter'
import { type TwoWayFieldConverter } from 'types/FieldConverters'
import {
  type ContextOfFieldAdapter,
  type ErrorOfFieldAdapter,
  type FieldAdapter,
  type FromOfFieldAdapter,
  type ToOfFieldAdapter,
  type ValuePathOfFieldAdapter,
} from './FieldAdapter'

export type MergedOfFieldAdaptersWithTwoWayConverter<
  FieldAdapters extends Readonly<Record<string, FieldAdapter>>,
  E,
  Context,
> = {
  [K in keyof FieldAdapters]: FieldAdapter<
    FromOfFieldAdapter<FieldAdapters[K]>,
    ToOfFieldAdapter<FieldAdapters[K]>,
    ErrorOfFieldAdapter<FieldAdapters[K]> | E,
    ValuePathOfFieldAdapter<FieldAdapters[K]>,
    ContextOfFieldAdapter<FieldAdapters[K]> & Context
  >
}

type ValuePathsOfFieldAdapters<FieldAdapters extends Readonly<Record<string, FieldAdapter>>> = {
  [K in keyof FieldAdapters]: ValuePathOfFieldAdapter<FieldAdapters[K]>
}[keyof FieldAdapters]

type TosOfFieldAdapters<FieldAdapters extends Readonly<Record<string, FieldAdapter>>> = {
  [K in keyof FieldAdapters]: ToOfFieldAdapter<FieldAdapters[K]>
}[keyof FieldAdapters]

export function mergeFieldAdaptersWithTwoWayConverter<
  // must have a field adapter for every validator
  FieldAdapters extends Readonly<Record<string, FieldAdapter>>,
  E,
  Context,
  P extends ValuePathsOfFieldAdapters<FieldAdapters>,
>(
  fieldAdapters: FieldAdapters,
  converter: TwoWayFieldConverter<
    TosOfFieldAdapters<FieldAdapters>,
    TosOfFieldAdapters<FieldAdapters>,
    E,
    P,
    Context
  >,
): MergedOfFieldAdaptersWithTwoWayConverter<FieldAdapters, E, Context> {
  return map<keyof FieldAdapters, FieldAdapter>(
    fieldAdapters,
    function (_key, adapter) {
      return {
        convert: chainAnnotatedFieldConverter(
          adapter.convert.bind(adapter),
          converter.convert.bind(converter),
        ),
        revert: adapter.revert && chainUnreliableFieldConverter(
          converter.revert.bind(converter),
          adapter.revert.bind(adapter),
        ),
        create: adapter.create.bind(adapter),
      }
    },
  )
}

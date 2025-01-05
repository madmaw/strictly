import { reduce } from '@strictly/base'
import { type Validator } from '@strictly/define'
import { type Simplify } from 'type-fest'
import {
  type FieldConversion,
  FieldConversionResult,
} from 'types/field_converters'
import { type FieldAdapter } from './field_adapter'

export type MergedOfFieldAdaptersWithValidators<
  // must have a field adapter for every validator
  FieldAdapters extends Readonly<Record<Key, FieldAdapter>>,
  Validators extends Partial<Readonly<Record<string, Validator>>>,
  Key extends keyof Validators = keyof Validators,
> = Simplify<{
  readonly [K in Key]: MergedOfFieldAdapterWithValidator<FieldAdapters[K], Validators[K]>
} & {
  readonly [K in Exclude<keyof FieldAdapters, Key>]: FieldAdapters[K]
}>

type MergedOfFieldAdapterWithValidator<
  A extends FieldAdapter,
  V extends Validator | undefined,
> = undefined extends V ? A
  : A extends FieldAdapter<infer From, infer To, infer E1, infer P1, infer C1>
    ? V extends Validator<From, infer E2, infer P2, infer C2> ? FieldAdapter<From, To, E1 | E2, P1 | P2, C1 | C2>
    : never
  : never

export function mergeAdaptersWithValidators<
  // must have a field adapter for every validator
  FieldAdapters extends Readonly<Record<Key, FieldAdapter>>,
  Validators extends Readonly<Record<string, Validator>>,
  Key extends keyof Validators = keyof Validators,
>(
  adapters: FieldAdapters,
  validators: Validators,
): MergedOfFieldAdaptersWithValidators<FieldAdapters, Validators, Key> {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return reduce<
    Key,
    FieldAdapter,
    Partial<Record<Key, FieldAdapter>>
  >(
    adapters,
    function (acc, key, adapter) {
      const validator = validators[key]
      if (validator == null) {
        acc[key] = adapter
        return acc
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      function revert(to: any, ...params: [any, any]): FieldConversion {
        const result = adapter.revert!(to, ...params)
        if (result.type === FieldConversionResult.Failure) {
          return result
        }
        const validationError = validator(result.value, ...params)
        if (validationError == null) {
          return result
        }
        return {
          type: FieldConversionResult.Failure,
          value: [result.value] as const,
          error: validationError,
        }
      }
      acc[key] = {
        ...adapter,
        revert: adapter.revert && revert,
      }
      return acc
    },
    {},
  ) as MergedOfFieldAdaptersWithValidators<FieldAdapters, Validators, Key>
}

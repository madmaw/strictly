import {
  annotations,
  lookup,
  reduce,
  validate,
  type Validator,
} from '@strictly/base'
import {
  type AnnotatedFieldConversion,
  type UnreliableFieldConversion,
  UnreliableFieldConversionType,
} from 'form/types/FieldConverters'
import { type Simplify } from 'type-fest'
import { type FieldAdapter } from './FieldAdapter'

export type MergedOfFieldAdaptersWithValidators<
  // must have a field adapter for every validator
  FieldAdapters extends Readonly<Record<Key, FieldAdapter>>,
  Validators extends Partial<Readonly<Record<string, Validator>>>,
  Key extends keyof Validators = keyof Validators,
> = Simplify<
  {
    readonly [K in Key]: MergedOfFieldAdapterWithValidator<
      FieldAdapters[K],
      Validators[K]
    >
  } & {
    readonly [K in Exclude<keyof FieldAdapters, Key>]: FieldAdapters[K]
  }
>

type MergedOfFieldAdapterWithValidator<
  A extends FieldAdapter,
  V extends Validator | undefined,
> = undefined extends V
  ? A
  : A extends FieldAdapter<infer From, infer To, infer E1, infer P1, infer C1>
    ? V extends Validator<From, infer E2, infer P2, infer C2>
      ? FieldAdapter<From, To, E1 | E2, P1 | P2, C1 & C2>
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
  return reduce<Key, FieldAdapter, Partial<Record<Key, FieldAdapter>>>(
    adapters,
    (acc, key, adapter) => {
      const maybeValidator = lookup(validators, key)
      if (maybeValidator == null) {
        acc[key] = adapter
        return acc
      }
      // the nested functions are hoisted, so they don't see the narrowed type
      const validator: Validator = maybeValidator
      function revert(
        // oxlint-disable-next-line typescript/no-explicit-any -- the adapters are intentionally untyped here
        to: any,
        // oxlint-disable-next-line typescript/no-explicit-any -- the adapters are intentionally untyped here
        ...params: [any, any]
      ): UnreliableFieldConversion {
        // oxlint-disable-next-line typescript/no-non-null-assertion -- only installed when the adapter can revert
        const result = adapter.revert!(to, ...params)
        if (result.type === UnreliableFieldConversionType.Failure) {
          return result
        }
        const validationError = validate(validator, result.value, ...params)
        if (validationError == null) {
          return result
        }
        return {
          type: UnreliableFieldConversionType.Failure,
          value: [result.value] as const,
          error: validationError,
        }
      }
      function convert(
        // oxlint-disable-next-line typescript/no-explicit-any -- the adapters are intentionally untyped here
        from: any,
        // oxlint-disable-next-line typescript/no-explicit-any -- the adapters are intentionally untyped here
        ...params: [any, any]
      ): AnnotatedFieldConversion {
        const {
          required: required1,
          readonly: readonly1,
          value,
        } = adapter.convert(from, ...params)
        const { required: required2, readonly: readonly2 } = annotations(
          validator,
          ...params,
        )
        return {
          value,
          required: required1 || required2,
          readonly: readonly1 || readonly2,
        }
      }
      acc[key] = {
        create: adapter.create.bind(adapter),
        convert,
        revert: adapter.revert && revert,
      }
      return acc
    },
    {},
  ) as MergedOfFieldAdaptersWithValidators<FieldAdapters, Validators, Key>
}

import {
  checkExists,
  map,
  type ReadonlyRecord,
  UnreachableError,
} from '@de/base'
import {
  flattenAccessorsOf,
  type FlattenedAccessorsOf,
  flattenJsonValueToTypePathsOf,
  type TypeDefHolder,
  type ValueTypeOf,
} from '@de/fine'
import {
  type AnyValueType,
  flattenValueTypeTo,
} from '@de/fine/transformers/flatteners/flatten_value_type_to'
import { type StrictTypeDef } from '@de/fine/types/strict_definitions'
import { runInAction } from 'mobx'
import { type FormField } from 'react/props'
import { type ValueOf } from 'type-fest'

export enum ConversionResult {
  Success = 0,
  Failure = 1,
}
export type Conversion<E, V> = {
  type: ConversionResult.Success,
  value: V,
} | {
  type: ConversionResult.Failure,
  error: E,
}

// convert to the model type from the display type
// for example a text field that renders an integer would have
// a `from` type of `string`, and a `to` type of `number`

export type Converter<
  E,
  Fields extends Record<string, FormField> = Record<string, FormField>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  To = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  From = any,
> = {
  convert(from: From, valuePath: keyof Fields, fields: Fields): Conversion<E, To>,
  revert(to: To): From,
}

type FlattenedConvertedFieldsOf<
  E,
  ValuePathsToConverters extends ReadonlyRecord<string, Converter<E>>,
> = {
  [K in keyof ValuePathsToConverters]: FormField<ReturnType<ValuePathsToConverters[K]['revert']>, E>
}

export type FlattenedTypePathsToConvertersOf<
  E,
  F extends ReadonlyRecord<string, TypeDefHolder>,
> = {
  readonly [
    K in keyof F
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ]?: Converter<E, Record<string, FormField>, any, ValueTypeOf<F[K]>>
}

type FieldOverride<E, V> = {
  error?: E,
  value?: V,
  dirty: boolean,
}

type FlattenedFieldOverrides<
  E,
  ValuePathsToConverters extends Readonly<Record<string, Converter<E>>>,
> = {
  -readonly [K in keyof ValuePathsToConverters]?: FieldOverride<E, ReturnType<ValuePathsToConverters[K]['revert']>>
}

export type ValuePathsToConvertersOf<
  E,
  JsonPaths extends ReadonlyRecord<string, string>,
  TypePathsToConverters extends Partial<Readonly<Record<ValueOf<JsonPaths>, Converter<E>>>>,
> = {
  readonly [
    K in keyof JsonPaths as unknown extends TypePathsToConverters[JsonPaths[K]] ? never : K
  ]: NonNullable<TypePathsToConverters[JsonPaths[K]]>
}

export class FormPresenter<
  T extends TypeDefHolder,
  E,
  // JsonPaths extends FlattenedJsonValueToTypePathsOf<T>,
  JsonPaths extends Readonly<Record<string, string>>,
  // TODO JsonPaths extends FlattenedJsonValueToTypePathsOf<T> = FlattenedJsonValueToTypePathsOf<T>
  TypePathsToConverters extends Partial<
    Readonly<Record<ValueOf<JsonPaths>, Converter<E, FlattenedConvertedFieldsOf<E, ValuePathsToConverters>>>>
  >,
  // TypePathsToConverters extends FlattenedTypePathsToConvertersOf<
  //   E,
  //   FlattenedTypeDefsOf<T, '*'>
  // >,
  ValuePathsToConverters extends Readonly<Record<string, Converter<E>>> = ValuePathsToConvertersOf<
    E,
    JsonPaths,
    TypePathsToConverters
  >,
> // ValuePathsToConverters extends Readonly<Record<string, Converter<E>>> = Readonly<Record<string, Converter<E>>>,
{
  constructor(
    private readonly typeDef: T,
    private readonly converters: TypePathsToConverters,
  ) {
  }

  private getConverterForValuePath(
    model: FormModel<T, E, JsonPaths, TypePathsToConverters, ValuePathsToConverters>,
    valuePath: keyof ValuePathsToConverters,
  ) {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const typePath = model.jsonPaths[valuePath as keyof JsonPaths]
    return checkExists(
      this.converters[typePath],
      'expected converter to be defined {} ({})',
      typePath,
      valuePath,
    )
  }

  private getAccessorForValuePath(
    model: FormModel<T, E, JsonPaths, TypePathsToConverters, ValuePathsToConverters>,
    valuePath: keyof ValuePathsToConverters,
  ) {
    return checkExists(
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      model.accessors[valuePath as keyof FlattenedAccessorsOf<T>],
      'no accessor found for value path {}',
      valuePath,
    )
  }

  setFieldValueAndValidate<K extends keyof ValuePathsToConverters>(
    model: FormModel<T, E, JsonPaths, TypePathsToConverters, ValuePathsToConverters>,
    valuePath: K,
    value: ReturnType<ValuePathsToConverters[K]['revert']>,
  ): void {
    const converter = this.getConverterForValuePath(model, valuePath)

    const conversion = converter.convert(value, valuePath, model.fields)
    runInAction(() => {
      switch (conversion.type) {
        case ConversionResult.Failure:
          model.fieldOverrides[valuePath] = {
            value,
            dirty: true,
            error: conversion.error,
          }
          break
        case ConversionResult.Success:
          delete model.fieldOverrides[valuePath]
          this.getAccessorForValuePath(model, valuePath).set(conversion.value)
          break
        default:
          throw new UnreachableError(conversion)
      }
    })
  }

  setFieldValue<K extends keyof ValuePathsToConverters>(
    model: FormModel<T, E, JsonPaths, TypePathsToConverters, ValuePathsToConverters>,
    valuePath: K,
    value: ReturnType<ValuePathsToConverters[K]['revert']>,
  ): void {
    runInAction(function () {
      model.fieldOverrides[valuePath] = {
        value,
        dirty: true,
      }
    })
  }

  clearFieldError<K extends keyof ValuePathsToConverters>(
    model: FormModel<T, E, JsonPaths, TypePathsToConverters, ValuePathsToConverters>,
    valuePath: K,
  ) {
    const fieldOverride = model.fieldOverrides[valuePath]
    if (fieldOverride != null) {
      runInAction(function () {
        model.fieldOverrides[valuePath] = {
          ...fieldOverride,
          // eslint-disable-next-line no-undefined
          error: undefined,
        }
      })
    }
  }

  validate(model: FormModel<T, E, JsonPaths, TypePathsToConverters, ValuePathsToConverters>) {
    const fieldOverrides = map(
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      model.fieldOverrides as Record<keyof ValuePathsToConverters, FieldOverride<E, AnyValueType>>,
      (
        valuePath: keyof ValuePathsToConverters,
        fieldOverride: FieldOverride<E, AnyValueType>,
      ): FieldOverride<E, AnyValueType> => {
        const converter = this.getConverterForValuePath(model, valuePath)
        const conversion = converter.convert(fieldOverride.value, valuePath, model.fields)
        switch (conversion.type) {
          case ConversionResult.Failure:
            return {
              ...fieldOverride,
              dirty: true,
              error: conversion.error,
            }
          case ConversionResult.Success:
            this.getAccessorForValuePath(model, valuePath).set(conversion.value)
            return {
              dirty: false,
            }
          default:
            throw new UnreachableError(conversion)
        }
      },
    )
    runInAction(function () {
      model.fieldOverrides = fieldOverrides
    })
  }

  createModel(value: ValueTypeOf<T>): FormModel<T, E, JsonPaths, TypePathsToConverters, ValuePathsToConverters> {
    return new FormModel<T, E, JsonPaths, TypePathsToConverters, ValuePathsToConverters>(
      this.typeDef,
      value,
      this.converters,
    )
  }
}

export class FormModel<
  T extends TypeDefHolder,
  E,
  JsonPaths extends ReadonlyRecord<string, string>,
  TypePathsToConverters extends Partial<Record<ValueOf<JsonPaths>, Converter<E>>>,
  ValuePathsToConverters extends Readonly<Record<string, Converter<E>>> = ValuePathsToConvertersOf<
    E,
    JsonPaths,
    TypePathsToConverters
  >,
> {
  value: ValueTypeOf<T>
  fieldOverrides: FlattenedFieldOverrides<E, ValuePathsToConverters> = {}

  constructor(
    private readonly typeDef: T,
    value: ValueTypeOf<T>,
    private readonly converters: TypePathsToConverters,
  ) {
    this.value = value
  }

  get accessors(): FlattenedAccessorsOf<T> {
    return flattenAccessorsOf<T>(
      this.typeDef,
      this.value,
      (value: ValueTypeOf<T>): void => {
        this.value = value
      },
    )
  }

  get fields(): FlattenedConvertedFieldsOf<E, ValuePathsToConverters> {
    return flattenValueTypeTo(
      this.typeDef,
      this.value,
      () => {},
      (_t: StrictTypeDef, v: AnyValueType, _setter, typePath, valuePath): FormField | undefined => {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const converter = this.converters[typePath as keyof TypePathsToConverters]
        if (converter == null) {
          // no converter means we don't render the value
          return
        }
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const fieldOverride = this.fieldOverrides[valuePath as keyof ValuePathsToConverters]
        const value = fieldOverride?.value ?? converter.revert(v)
        return {
          value,
          error: fieldOverride?.error,
          disabled: false,
        }
      },
    )
  }

  get jsonPaths(): JsonPaths {
    return flattenJsonValueToTypePathsOf<T, JsonPaths>(
      this.typeDef,
      this.value,
    )
  }
}

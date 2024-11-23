import {
  checkExists,
  map,
  type ReadonlyRecord,
  UnreachableError,
} from '@de/base'
import {
  type Accessor,
  flattenAccessorsOf,
  type FlattenedValueTypesOf,
  flattenJsonValueToTypePathsOf,
  type MobxValueTypeOf,
  type TypeDefHolder,
  type ValueTypeOf,
} from '@de/fine'
import { mobxCopy } from '@de/fine/transformers/copies/mobx_copy'
import {
  type AnyValueType,
  flattenValueTypeTo,
} from '@de/fine/transformers/flatteners/flatten_value_type_to'
import { type StrictTypeDef } from '@de/fine/types/strict_definitions'
import {
  computed,
  observable,
  runInAction,
} from 'mobx'
import { type SimplifyDeep } from 'type-fest'
import {
  ConversionResult,
  type Converter,
  type ErrorTypeOfConverter,
  type FromTypeOfConverter,
} from 'types/converter'
import { type FormField } from 'types/form_field'

export type FlattenedConvertedFieldsOf<
  ValuePathsToConverters extends ReadonlyRecord<string, Converter>,
> = {
  [K in keyof ValuePathsToConverters]: FormField<
    ErrorTypeOfConverter<ValuePathsToConverters[K]>,
    FromTypeOfConverter<ValuePathsToConverters[K]>
  >
}

export type FlattenedTypePathsToConvertersOf<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  F extends Readonly<Record<string, any>>,
> = {
  readonly [
    K in keyof F
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ]?: Converter<any, Record<string, FormField>, F[K], any>
}

type FieldOverride<E, V> = {
  error?: E,
  value?: V,
  dirty: boolean,
}

type FlattenedFieldOverrides<
  ValuePathsToConverters extends Readonly<Record<string, Converter>>,
> = {
  -readonly [K in keyof ValuePathsToConverters]?: FieldOverride<
    ErrorTypeOfConverter<ValuePathsToConverters[K]>,
    FromTypeOfConverter<ValuePathsToConverters[K]>
  >
}

export type ValuePathsToConvertersOf<
  TypePathsToConverters extends Partial<Readonly<Record<string, Converter>>>,
  JsonPaths extends Readonly<Record<string, string>>,
> = {
  readonly [
    K in keyof JsonPaths as unknown extends TypePathsToConverters[JsonPaths[K]] ? never : K
  ]: NonNullable<TypePathsToConverters[JsonPaths[K]]>
}

export class FormPresenter<
  T extends TypeDefHolder,
  JsonPaths extends Readonly<Record<string, string>>,
  TypePathsToConverters extends FlattenedTypePathsToConvertersOf<FlattenedValueTypesOf<T, '*'>>,
  ValuePathsToConverters extends ValuePathsToConvertersOf<TypePathsToConverters, JsonPaths> = ValuePathsToConvertersOf<
    TypePathsToConverters,
    JsonPaths
  >,
> {
  constructor(
    private readonly typeDef: T,
    private readonly converters: TypePathsToConverters,
  ) {
  }

  private getConverterForValuePath(
    model: FormModel<T, JsonPaths, TypePathsToConverters, ValuePathsToConverters>,
    valuePath: keyof ValuePathsToConverters,
  ) {
    const typePath = checkExists(
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      model.jsonPaths[valuePath as keyof JsonPaths],
      '{} is not a valid value path for the current value ({})',
      valuePath,
      Object.keys(model.jsonPaths),
    )
    return checkExists(
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      this.converters[typePath as keyof TypePathsToConverters],
      'expected converter to be defined {} ({})',
      typePath,
      valuePath,
    )
  }

  private getAccessorForValuePath(
    model: FormModel<T, JsonPaths, TypePathsToConverters, ValuePathsToConverters>,
    valuePath: keyof ValuePathsToConverters,
  ) {
    return checkExists(
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      model.accessors[valuePath as string],
      'no accessor found for value path {}',
      valuePath,
    )
  }

  setFieldValueAndValidate<K extends keyof ValuePathsToConverters>(
    model: FormModel<T, JsonPaths, TypePathsToConverters, ValuePathsToConverters>,
    valuePath: K,
    value: FromTypeOfConverter<ValuePathsToConverters[K]>,
  ): void {
    const converter = this.getConverterForValuePath(model, valuePath)

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const conversion = converter.convert(value, valuePath as string, model.fields)
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
    model: FormModel<T, JsonPaths, TypePathsToConverters, ValuePathsToConverters>,
    valuePath: K,
    value: FromTypeOfConverter<ValuePathsToConverters[K]>,
  ): void {
    runInAction(function () {
      model.fieldOverrides[valuePath] = {
        value,
        dirty: true,
      }
    })
  }

  clearFieldError<K extends keyof ValuePathsToConverters>(
    model: FormModel<T, JsonPaths, TypePathsToConverters, ValuePathsToConverters>,
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

  validate(model: FormModel<T, JsonPaths, TypePathsToConverters, ValuePathsToConverters>) {
    runInAction(() => {
      const fieldOverrides = map(
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any
        model.fieldOverrides as Record<keyof ValuePathsToConverters, FieldOverride<any, any>>,
        (
          valuePath: keyof ValuePathsToConverters,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          fieldOverride: FieldOverride<any, any>,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ): FieldOverride<any, any> => {
          const converter = this.getConverterForValuePath(model, valuePath)
          const value = fieldOverride.dirty
            ? fieldOverride.value
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            : converter.revert(model.accessors[valuePath as string].value)
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          const conversion = converter.convert(value, valuePath as string, model.fields)
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
      model.fieldOverrides = fieldOverrides
    })
  }

  createModel(value: ValueTypeOf<T>): FormModel<T, JsonPaths, TypePathsToConverters, ValuePathsToConverters> {
    return new FormModel<T, JsonPaths, TypePathsToConverters, ValuePathsToConverters>(
      this.typeDef,
      value,
      this.converters,
    )
  }
}

export class FormModel<
  T extends TypeDefHolder,
  JsonPaths extends Readonly<Record<string, string>>,
  TypePathsToConverters extends FlattenedTypePathsToConvertersOf<FlattenedValueTypesOf<T, '*'>>,
  ValuePathsToConverters extends ValuePathsToConvertersOf<TypePathsToConverters, JsonPaths> = ValuePathsToConvertersOf<
    TypePathsToConverters,
    JsonPaths
  >,
> {
  @observable.ref
  accessor value: MobxValueTypeOf<T>
  @observable.shallow
  accessor fieldOverrides: FlattenedFieldOverrides<ValuePathsToConverters> = {}

  constructor(
    private readonly typeDef: T,
    value: ValueTypeOf<T>,
    private readonly converters: TypePathsToConverters,
  ) {
    this.value = mobxCopy(typeDef, value)
  }

  @computed
  // should only be referenced internally, so loosely type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get accessors(): Readonly<Record<string, Accessor<any>>> {
    // TODO flatten mobx accessors of actually!
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return flattenAccessorsOf<T, Readonly<Record<string, Accessor<any>>>>(
      this.typeDef,
      this.value,
      (value: ValueTypeOf<T>): void => {
        this.value = mobxCopy(this.typeDef, value)
      },
    )
  }

  @computed
  get fields(): SimplifyDeep<FlattenedConvertedFieldsOf<ValuePathsToConverters>> {
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

  @computed
  get jsonPaths(): JsonPaths {
    return flattenJsonValueToTypePathsOf<T, JsonPaths>(
      this.typeDef,
      this.value,
    )
  }
}

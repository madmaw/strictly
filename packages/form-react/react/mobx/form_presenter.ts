import {
  assertExistsAndReturn,
  toArray,
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
import { jsonValuePathToTypePath } from '@de/fine'
import { mobxCopy } from '@de/fine/transformers/copies/mobx_copy'
import { flattenTypeDefsOf } from '@de/fine/transformers/flatteners/flatten_type_defs_of'
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
import {
  type SimplifyDeep,
  type ValueOf,
} from 'type-fest'
import { type Field } from 'types/field'
import {
  FieldConversionResult,
} from 'types/field_converter'
import {
  type ErrorTypeOfFieldAdapter,
  type FieldAdapter,
  type FromTypeOfFieldAdapter,
} from './field_adapter'

export type FlattenedConvertedFieldsOf<
  ValuePathsToAdapters extends Readonly<Record<string, FieldAdapter>>,
> = {
  readonly [K in keyof ValuePathsToAdapters]: Field<
    ErrorTypeOfFieldAdapter<ValuePathsToAdapters[K]>,
    FromTypeOfFieldAdapter<ValuePathsToAdapters[K]>
  >
}

export type FlattenedTypePathsToAdaptersOf<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  F extends Readonly<Record<string, any>>,
> = {
  readonly [
    K in keyof F
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ]?: FieldAdapter<any, Readonly<Record<string, Field>>, F[K], any>
}

type FieldOverride<V> = {
  value: V,
  // seems like something we'll need?
  // dirty: boolean,
}

type FlattenedFieldOverrides<
  ValuePathsToAdapters extends Readonly<Record<string, FieldAdapter>>,
> = {
  -readonly [K in keyof ValuePathsToAdapters]?: FieldOverride<
    FromTypeOfFieldAdapter<ValuePathsToAdapters[K]>
  >
}

type FlattenedErrors<
  ValuePathsToAdapters extends Readonly<Record<string, FieldAdapter>>,
> = {
  -readonly [K in keyof ValuePathsToAdapters]?: ErrorTypeOfFieldAdapter<ValuePathsToAdapters[K]>
}

export type ValuePathsToAdaptersOf<
  TypePathsToAdapters extends Partial<Readonly<Record<string, FieldAdapter>>>,
  JsonPaths extends Readonly<Record<string, string>>,
> = keyof TypePathsToAdapters extends ValueOf<JsonPaths> ? {
    readonly [
      K in keyof JsonPaths as unknown extends TypePathsToAdapters[JsonPaths[K]] ? never : K
    ]: NonNullable<TypePathsToAdapters[JsonPaths[K]]>
  }
  : never

export class FormPresenter<
  T extends TypeDefHolder,
  JsonPaths extends Readonly<Record<string, string>>,
  TypePathsToAdapters extends FlattenedTypePathsToAdaptersOf<FlattenedValueTypesOf<T, '*'>>,
  ValuePathsToAdapters extends ValuePathsToAdaptersOf<TypePathsToAdapters, JsonPaths> = ValuePathsToAdaptersOf<
    TypePathsToAdapters,
    JsonPaths
  >,
> {
  constructor(
    private readonly typeDef: T,
    private readonly adapters: TypePathsToAdapters,
  ) {
  }

  private maybeGetAdapterForValuePath(
    model: FormModel<T, JsonPaths, TypePathsToAdapters, ValuePathsToAdapters>,
    valuePath: keyof ValuePathsToAdapters,
  ) {
    const typePath = assertExistsAndReturn(
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      model.jsonPaths[valuePath as keyof JsonPaths],
      '{} is not a valid value path for the current value ({})',
      valuePath,
      Object.keys(model.jsonPaths),
    )
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return this.adapters[typePath as keyof TypePathsToAdapters]
  }

  private getAdapterForValuePath(
    model: FormModel<T, JsonPaths, TypePathsToAdapters, ValuePathsToAdapters>,
    valuePath: keyof ValuePathsToAdapters,
  ) {
    return assertExistsAndReturn(
      this.maybeGetAdapterForValuePath(model, valuePath),
      'expected adapter to be defined {}',
      valuePath,
    )
  }

  setFieldValueAndValidate<K extends keyof ValuePathsToAdapters>(
    model: FormModel<T, JsonPaths, TypePathsToAdapters, ValuePathsToAdapters>,
    valuePath: K,
    value: FromTypeOfFieldAdapter<ValuePathsToAdapters[K]>,
  ): boolean {
    return this.internalSetFieldValue(model, valuePath, value, true)
  }

  setFieldValue<K extends keyof ValuePathsToAdapters>(
    model: FormModel<T, JsonPaths, TypePathsToAdapters, ValuePathsToAdapters>,
    valuePath: K,
    value: FromTypeOfFieldAdapter<ValuePathsToAdapters[K]>,
  ): boolean {
    return this.internalSetFieldValue(model, valuePath, value, false)
  }

  private internalSetFieldValue<K extends keyof ValuePathsToAdapters>(
    model: FormModel<T, JsonPaths, TypePathsToAdapters, ValuePathsToAdapters>,
    valuePath: K,
    value: FromTypeOfFieldAdapter<ValuePathsToAdapters[K]>,
    displayValidation: boolean,
  ): boolean {
    const { converter } = this.getAdapterForValuePath(model, valuePath)

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any
    const conversion = converter.convert(value, valuePath as any, model.fields)
    const accessor = model.getAccessorForValuePath(valuePath)
    return runInAction(() => {
      model.fieldOverrides[valuePath] = {
        value,
      }
      switch (conversion.type) {
        case FieldConversionResult.Failure:
          if (displayValidation) {
            model.errors[valuePath] = conversion.error
          }
          if (conversion.value != null) {
            accessor?.set(conversion.value[0])
          }
          return false
        case FieldConversionResult.Success:
          delete model.errors[valuePath]
          accessor?.set(conversion.value)
          return true
        default:
          throw new UnreachableError(conversion)
      }
    })
  }

  clearFieldError<K extends keyof ValuePathsToAdapters>(
    model: FormModel<T, JsonPaths, TypePathsToAdapters, ValuePathsToAdapters>,
    valuePath: K,
  ) {
    const fieldOverride = model.fieldOverrides[valuePath]
    if (fieldOverride != null) {
      runInAction(function () {
        delete model.errors[valuePath]
      })
    }
  }

  clearAll(model: FormModel<T, JsonPaths, TypePathsToAdapters, ValuePathsToAdapters>, value: ValueTypeOf<T>): void {
    runInAction(() => {
      model.errors = {}
      model.fieldOverrides = {}
      model.value = mobxCopy(this.typeDef, value)
    })
  }

  validateField<K extends keyof ValuePathsToAdapters>(
    model: FormModel<T, JsonPaths, TypePathsToAdapters, ValuePathsToAdapters>,
    valuePath: K,
  ): boolean {
    const {
      converter,
      valueFactory,
    } = this.getAdapterForValuePath(model, valuePath)
    const fieldOverride = model.fieldOverrides[valuePath]
    const accessor = model.getAccessorForValuePath(valuePath)
    const storedValue = converter.revert(
      accessor != null
        ? accessor.value
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        : valueFactory.create(valuePath as string, model.fields),
    )
    const value = fieldOverride != null
      ? fieldOverride.value
      : storedValue
    const dirty = storedValue !== value
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any
    const conversion = converter.convert(value, valuePath as any, model.fields)
    return runInAction(function () {
      switch (conversion.type) {
        case FieldConversionResult.Failure:
          model.errors[valuePath] = conversion.error
          if (conversion.value != null && accessor != null && dirty) {
            accessor.set(conversion.value[0])
          }
          return false
        case FieldConversionResult.Success:
          delete model.errors[valuePath]
          if (accessor != null && dirty) {
            accessor.set(conversion.value)
          }
          return true
        default:
          throw new UnreachableError(conversion)
      }
    })
  }

  validateAll(model: FormModel<T, JsonPaths, TypePathsToAdapters, ValuePathsToAdapters>): boolean {
    // sort keys shortest to longest so parent changes don't overwrite child changes
    const accessors = toArray(model.accessors).toSorted(function ([a], [b]) {
      return a.length - b.length
    })
    return runInAction(() => {
      return accessors.reduce(
        (
          success,
          [
            valuePath,
            accessor,
          ],
        ): boolean => {
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          const adapterPath = valuePath as keyof ValuePathsToAdapters
          const adapter = this.maybeGetAdapterForValuePath(model, adapterPath)
          if (adapter == null) {
            // no adapter == there should be nothing specified for this field
            return success
          }
          const {
            converter,
          } = adapter
          const fieldOverride = model.fieldOverrides[adapterPath]
          const storedValue = converter.revert(accessor.value)
          const value = fieldOverride != null
            ? fieldOverride.value
            : storedValue
          // TODO more nuanced comparison
          const dirty = fieldOverride != null && fieldOverride.value !== storedValue

          const conversion = converter.convert(value, valuePath, model.fields)
          switch (conversion.type) {
            case FieldConversionResult.Failure:
              model.errors[adapterPath] = conversion.error
              if (conversion.value != null && dirty) {
                accessor.set(conversion.value[0])
              }
              return false
            case FieldConversionResult.Success:
              if (dirty) {
                accessor.set(conversion.value)
              }
              delete model.errors[adapterPath]
              return success
            default:
              throw new UnreachableError(conversion)
          }
        },
        true,
      )
    })
  }

  createModel(value: ValueTypeOf<T>): FormModel<T, JsonPaths, TypePathsToAdapters, ValuePathsToAdapters> {
    return new FormModel<T, JsonPaths, TypePathsToAdapters, ValuePathsToAdapters>(
      this.typeDef,
      value,
      this.adapters,
    )
  }
}

export class FormModel<
  T extends TypeDefHolder,
  JsonPaths extends Readonly<Record<string, string>>,
  TypePathsToAdapters extends FlattenedTypePathsToAdaptersOf<FlattenedValueTypesOf<T, '*'>>,
  ValuePathsToAdapters extends ValuePathsToAdaptersOf<TypePathsToAdapters, JsonPaths> = ValuePathsToAdaptersOf<
    TypePathsToAdapters,
    JsonPaths
  >,
> {
  @observable.ref
  accessor value: MobxValueTypeOf<T>
  @observable.shallow
  accessor fieldOverrides: FlattenedFieldOverrides<ValuePathsToAdapters> = {}
  @observable.shallow
  accessor errors: FlattenedErrors<ValuePathsToAdapters> = {}

  private readonly flattenedTypeDefs: Readonly<Record<string, TypeDefHolder>>

  constructor(
    private readonly typeDef: T,
    value: ValueTypeOf<T>,
    private readonly converters: TypePathsToAdapters,
  ) {
    this.value = mobxCopy(typeDef, value)
    this.flattenedTypeDefs = flattenTypeDefsOf(typeDef)
  }

  @computed
  get fields(): SimplifyDeep<FlattenedConvertedFieldsOf<ValuePathsToAdapters>> {
    return new Proxy<SimplifyDeep<FlattenedConvertedFieldsOf<ValuePathsToAdapters>>>(
      this.knownFields,
      {
        get: (target, prop) => {
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any
          const field = (target as any)[prop]
          if (field != null) {
            return field
          }
          if (typeof prop === 'string') {
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            return this.maybeSynthesizeFieldByValuePath(prop as keyof ValuePathsToAdapters)
          }
        },
      },
    )
  }

  @computed
  private get knownFields(): SimplifyDeep<FlattenedConvertedFieldsOf<ValuePathsToAdapters>> {
    return flattenValueTypeTo(
      this.typeDef,
      this.value,
      () => {},
      // TODO swap these to valuePath, typePath in flatten
      (_t: StrictTypeDef, _v: AnyValueType, _setter, typePath, valuePath): Field | undefined => {
        return this.synthesizeFieldByPaths(
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          valuePath as keyof ValuePathsToAdapters,
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          typePath as keyof TypePathsToAdapters,
        )
      },
    )
  }

  private maybeSynthesizeFieldByValuePath(valuePath: keyof ValuePathsToAdapters): Field | undefined {
    let typePath: keyof TypePathsToAdapters
    try {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      typePath = jsonValuePathToTypePath<JsonPaths, keyof JsonPaths>(
        this.typeDef,
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        valuePath as keyof JsonPaths,
      ) as keyof TypePathsToAdapters
    } catch (e) {
      // TODO make jsonValuePathToTypePath return null in the event of an invalid
      // value path instead of throwing an exception
      // assume that the path was invalid
      return
    }
    return this.synthesizeFieldByPaths(valuePath, typePath)
  }

  private synthesizeFieldByPaths(valuePath: keyof ValuePathsToAdapters, typePath: keyof TypePathsToAdapters) {
    const adapter = this.converters[typePath]
    if (adapter == null) {
      // invalid path, which can happen
      return
    }
    const {
      converter,
      valueFactory,
    } = adapter

    const fieldOverride = this.fieldOverrides[valuePath]
    const accessor = this.getAccessorForValuePath(valuePath)
    const value = fieldOverride
      ? fieldOverride.value
      : converter.revert(accessor != null
        ? accessor.value
        : mobxCopy(
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          this.flattenedTypeDefs[typePath as string],
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          valueFactory.create(valuePath as string, this.fields),
        ))
    const error = this.errors[valuePath]
    return {
      value,
      error,
      // if we can't write it back, then we have to disable it
      disabled: accessor == null,
    }
  }

  getAccessorForValuePath(valuePath: keyof ValuePathsToAdapters) {
    return assertExistsAndReturn(
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      this.accessors[valuePath as string],
      'no accessor found for value path {}',
      valuePath,
    )
  }

  @computed
  // should only be referenced internally, so loosely typed
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
  get jsonPaths(): JsonPaths {
    return flattenJsonValueToTypePathsOf<T, JsonPaths>(
      this.typeDef,
      this.value,
    )
  }
}

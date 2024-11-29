import {
  assertExistsAndReturn,
  reduce,
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

  private getAdapterForValuePath(
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
    return assertExistsAndReturn(
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      this.adapters[typePath as keyof TypePathsToAdapters],
      'expected converter to be defined {} ({})',
      typePath,
      valuePath,
    )
  }

  private getAccessorForValuePath(
    model: FormModel<T, JsonPaths, TypePathsToAdapters, ValuePathsToAdapters>,
    valuePath: keyof ValuePathsToAdapters,
  ) {
    return assertExistsAndReturn(
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      model.accessors[valuePath as string],
      'no accessor found for value path {}',
      valuePath,
    )
  }

  setFieldValueAndValidate<K extends keyof ValuePathsToAdapters>(
    model: FormModel<T, JsonPaths, TypePathsToAdapters, ValuePathsToAdapters>,
    valuePath: K,
    value: FromTypeOfFieldAdapter<ValuePathsToAdapters[K]>,
  ): boolean {
    const { converter } = this.getAdapterForValuePath(model, valuePath)

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any
    const conversion = converter.convert(value, valuePath as any, model.fields)
    return runInAction(() => {
      model.fieldOverrides[valuePath] = {
        value,
      }
      switch (conversion.type) {
        case FieldConversionResult.Failure:
          model.errors[valuePath] = conversion.error
          return false
        case FieldConversionResult.Success:
          delete model.errors[valuePath]
          return true
        default:
          throw new UnreachableError(conversion)
      }
    })
  }

  setFieldValue<K extends keyof ValuePathsToAdapters>(
    model: FormModel<T, JsonPaths, TypePathsToAdapters, ValuePathsToAdapters>,
    valuePath: K,
    value: FromTypeOfFieldAdapter<ValuePathsToAdapters[K]>,
  ): void {
    runInAction(function () {
      model.fieldOverrides[valuePath] = {
        value,
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
    const fieldOverride = model.fieldOverrides[valuePath]
    if (fieldOverride != null) {
      const { converter } = this.getAdapterForValuePath(model, valuePath)
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any
      const conversion = converter.convert(fieldOverride.value, valuePath as any, model.fields)
      return runInAction(function () {
        switch (conversion.type) {
          case FieldConversionResult.Failure:
            model.errors[valuePath] = conversion.error
            return false
          case FieldConversionResult.Success:
            delete model.errors[valuePath]
            return true
          default:
            throw new UnreachableError(conversion)
        }
      })
    }
    return true
  }

  validateAndMaybeSaveAll(model: FormModel<T, JsonPaths, TypePathsToAdapters, ValuePathsToAdapters>): boolean {
    // TODO want to iteratively reduce accessors (start from shortest key to longest key and every time
    // we successfully set the value, restart the validate and save process)
    return runInAction(() => {
      return reduce(
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any
        model.fieldOverrides as Record<keyof ValuePathsToAdapters, FieldOverride<any>>,
        (
          success: boolean,
          valuePath: keyof ValuePathsToAdapters,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          { value }: FieldOverride<any>,
        ): boolean => {
          const { converter } = this.getAdapterForValuePath(model, valuePath)
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any
          const conversion = converter.convert(value, valuePath as any, model.fields)
          switch (conversion.type) {
            case FieldConversionResult.Failure:
              model.errors[valuePath] = conversion.error
              return false
            case FieldConversionResult.Success:
              this.getAccessorForValuePath(model, valuePath).set(conversion.value)
              delete model.errors[valuePath]
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
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const accessor = this.accessors[valuePath as string]
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

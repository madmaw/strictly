import {
  assertExists,
  assertExistsAndReturn,
  assertState,
  checkValidNumber,
  type ElementOfArray,
  type Maybe,
  toArray,
  UnreachableError,
} from '@de/base'
import {
  type Accessor,
  flattenAccessorsOf,
  type FlattenedValueTypesOf,
  type MobxValueTypeOf,
  type ReadonlyTypeDefOf,
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
import { jsonPathPop } from '@de/fine/transformers/flatteners/json_path'
import { type StrictTypeDef } from '@de/fine/types/strict_definitions'
import {
  computed,
  observable,
  runInAction,
} from 'mobx'
import {
  type SimplifyDeep,
  type StringKeyOf,
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
import {
  type FlattenedListTypeDefsOf,
} from './flattened_list_type_defs_of'

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FieldOverride<V = any> = {
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
    readonly typeDef: T,
    private readonly adapters: TypePathsToAdapters,
  ) {
  }

  private maybeGetAdapterForValuePath(valuePath: keyof ValuePathsToAdapters) {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const typePath = jsonValuePathToTypePath(this.typeDef, valuePath as string, true)
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return this.adapters[typePath as keyof TypePathsToAdapters]
  }

  private getAdapterForValuePath(valuePath: keyof ValuePathsToAdapters) {
    return assertExistsAndReturn(
      this.maybeGetAdapterForValuePath(valuePath),
      'expected adapter to be defined {}',
      valuePath,
    )
  }

  typePath<K extends keyof JsonPaths>(valuePath: K): JsonPaths[K] {
    return jsonValuePathToTypePath<JsonPaths, K>(this.typeDef, valuePath, true)
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

  addListItem<K extends keyof FlattenedListTypeDefsOf<T>>(
    model: FormModel<T, JsonPaths, TypePathsToAdapters, ValuePathsToAdapters>,
    valuePath: K,
    elementValue: Maybe<ElementOfArray<FlattenedValueTypesOf<T>[K]>>,
    index?: number,
  ) {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const listValuePath = valuePath as string
    const accessor = model.accessors[valuePath]
    const listTypePath = this.typePath(valuePath)
    const definedIndex = index ?? accessor.value.length
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const elementTypePath = `${listTypePath}.*` as keyof TypePathsToAdapters
    const elementAdapter = assertExistsAndReturn(
      this.adapters[elementTypePath],
      'no adapter specified for list {} ({})',
      elementTypePath,
      valuePath,
    )
    // TODO validation on new elements
    const element = elementValue != null
      ? elementValue[0]
      : elementAdapter.valueFactory.create(
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        elementTypePath as string,
        model.fields,
      )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const originalList: any[] = accessor.value
    const newList = [
      ...originalList.slice(0, definedIndex),
      element,
      ...originalList.slice(definedIndex),
    ]
    // shuffle the overrides around to account for new indices
    // to so this we need to sort the array indices in descending order
    const targetPaths = Object.keys(model.fieldOverrides).filter(function (v) {
      return v.startsWith(`${listValuePath}.`)
    }).map(function (v) {
      const parts = v.substring(listValuePath.length + 1).split('.')
      const index = parseInt(parts[0])
      return [
        index,
        parts.slice(1),
      ] as const
    }).filter(function ([index]) {
      return index >= definedIndex
    }).sort(function ([a], [b]) {
      // descending
      return b - a
    })
    runInAction(function () {
      targetPaths.forEach(function ([
        index,
        postfix,
      ]) {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const fromJsonPath = [
          listValuePath,
          `${index}`,
          ...postfix,
        ].join('.') as keyof ValuePathsToAdapters
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const toJsonPath = [
          listValuePath,
          `${index + 1}`,
          ...postfix,
        ].join('.') as keyof ValuePathsToAdapters
        const fieldOverride = model.fieldOverrides[fromJsonPath]
        delete model.fieldOverrides[fromJsonPath]
        model.fieldOverrides[toJsonPath] = fieldOverride
        const error = model.errors[fromJsonPath]
        delete model.errors[fromJsonPath]
        model.errors[toJsonPath] = error
      })
      accessor.set(newList)
      // delete any value overrides so the new list isn't shadowed
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      delete model.fieldOverrides[listValuePath as keyof ValuePathsToAdapters]
    })
  }

  removeListItem<K extends keyof FlattenedListTypeDefsOf<T>>(
    model: FormModel<T, JsonPaths, TypePathsToAdapters, ValuePathsToAdapters>,
    elementValuePath: `${K}.${number}`,
  ) {
    const [
      listValuePath,
      elementIndexString,
    ] = assertExistsAndReturn(
      jsonPathPop(elementValuePath),
      'expected a path with two or more segments {}',
      elementValuePath,
    )
    const accessor = model.accessors[listValuePath]
    const elementIndex = checkValidNumber(
      parseInt(elementIndexString),
      'unexpected index {} ({})',
      elementIndexString,
      elementValuePath,
    )
    const newList = [...accessor.value]
    assertState(
      elementIndex >= 0 && elementIndex < newList.length,
      'invalid index from path {} ({})',
      elementIndex,
      elementValuePath,
    )
    newList.splice(elementIndex, 1)

    // shuffle the overrides around to account for new indices
    // to so this we need to sort the array indices in descending order
    const targetPaths = Object.keys(model.fieldOverrides).filter(function (v) {
      return v.startsWith(`${listValuePath}.`)
    }).map(function (v) {
      const parts = v.substring(listValuePath.length + 1).split('.')
      const index = parseInt(parts[0])
      return [
        index,
        parts.slice(1),
      ] as const
    }).filter(function ([index]) {
      return index >= elementIndex
    }).sort(function ([a], [b]) {
      // ascending
      return a - b
    })

    runInAction(function () {
      targetPaths.forEach(function ([
        index,
        postfix,
      ]) {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const fromJsonPath = [
          listValuePath,
          `${index}`,
          ...postfix,
        ].join('.') as keyof ValuePathsToAdapters
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const toJsonPath = [
          listValuePath,
          `${index - 1}`,
          ...postfix,
        ].join('.') as keyof ValuePathsToAdapters
        const fieldOverride = model.fieldOverrides[fromJsonPath]
        delete model.fieldOverrides[fromJsonPath]
        model.fieldOverrides[toJsonPath] = fieldOverride
        const error = model.errors[fromJsonPath]
        delete model.errors[fromJsonPath]
        model.errors[toJsonPath] = error
      })
      accessor.set(newList)
      // delete any value overrides so the new list isn't shadowed
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      delete model.fieldOverrides[listValuePath as keyof ValuePathsToAdapters]
    })
  }

  private internalSetFieldValue<K extends keyof ValuePathsToAdapters>(
    model: FormModel<T, JsonPaths, TypePathsToAdapters, ValuePathsToAdapters>,
    valuePath: K,
    value: FromTypeOfFieldAdapter<ValuePathsToAdapters[K]>,
    displayValidation: boolean,
  ): boolean {
    const { converter } = this.getAdapterForValuePath(valuePath)

    // eslint-disable-next-line @typescript-eslint/unbound-method
    assertExists(converter.convert, 'setting value not supported {}', valuePath)

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
          if (conversion.value != null && accessor != null) {
            accessor.set(conversion.value[0])
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

  clearFieldValue<K extends StringKeyOf<ValuePathsToAdapters>>(
    model: FormModel<T, JsonPaths, TypePathsToAdapters, ValuePathsToAdapters>,
    valuePath: K,
  ) {
    const typePath = this.typePath(valuePath)
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const adapter = this.adapters[typePath as keyof TypePathsToAdapters]
    if (adapter == null) {
      return
    }
    const {
      converter,
      valueFactory,
    } = adapter
    const accessor = model.accessors[valuePath]
    const value = accessor == null ? valueFactory.create(valuePath, model.fields) : accessor.value
    const displayValue = converter.revert(value, valuePath)
    runInAction(function () {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any
      model.fieldOverrides[valuePath as any as keyof ValuePathsToAdapters] = {
        value: displayValue,
      }
    })
  }

  clearAll(model: FormModel<T, JsonPaths, TypePathsToAdapters, ValuePathsToAdapters>, value: ValueTypeOf<T>): void {
    runInAction(() => {
      model.errors = {}
      // TODO this isn't correct, should reload from value
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
    } = this.getAdapterForValuePath(valuePath)
    const fieldOverride = model.fieldOverrides[valuePath]
    const accessor = model.getAccessorForValuePath(valuePath)
    const storedValue = converter.revert(
      accessor != null
        ? accessor.value
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        : valueFactory.create(valuePath as string, model.fields),
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      valuePath as string,
    )
    const value = fieldOverride != null
      ? fieldOverride.value
      : storedValue
    const dirty = storedValue !== value
    // eslint-disable-next-line @typescript-eslint/unbound-method
    assertExists(converter.convert, 'changing field directly not supported {}', valuePath)

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const conversion = converter.convert(value, valuePath as string, model.fields)
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
          const adapter = this.maybeGetAdapterForValuePath(adapterPath)
          if (adapter == null) {
            // no adapter == there should be nothing specified for this field
            return success
          }
          const {
            converter,
          } = adapter
          if (converter.convert == null) {
            // no convert method means this field is immutable
            return success
          }
          const fieldOverride = model.fieldOverrides[adapterPath]
          const storedValue = converter.revert(accessor.value, valuePath)
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

  createModel(value: ValueTypeOf<ReadonlyTypeDefOf<T>>): FormModel<
    T,
    JsonPaths,
    TypePathsToAdapters,
    ValuePathsToAdapters
  > {
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
  accessor fieldOverrides: FlattenedFieldOverrides<ValuePathsToAdapters>
  @observable.shallow
  accessor errors: FlattenedErrors<ValuePathsToAdapters> = {}

  private readonly flattenedTypeDefs: Readonly<Record<string, TypeDefHolder>>

  constructor(
    private readonly typeDef: T,
    value: ValueTypeOf<ReadonlyTypeDefOf<T>>,
    private readonly adapters: TypePathsToAdapters,
  ) {
    this.value = mobxCopy(typeDef, value)
    this.flattenedTypeDefs = flattenTypeDefsOf(typeDef)
    // pre-populate field overrides for consistent behavior when default information is overwritten
    // then returned to
    this.fieldOverrides = flattenValueTypeTo(
      typeDef,
      this.value,
      () => {},
      (_t: StrictTypeDef, value: AnyValueType, _setter, typePath, valuePath): FieldOverride | undefined => {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const adapter = this.adapters[typePath as keyof TypePathsToAdapters]
        if (adapter == null) {
          return
        }
        const { converter } = adapter
        if (converter.convert == null) {
          // no need to store a temporary value if the value cannot be written back
          return
        }
        const displayValue = converter.revert(value, valuePath)
        return {
          value: displayValue,
        }
      },
    )
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
        true,
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
    const adapter = this.adapters[typePath]
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
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const fieldTypeDef = this.flattenedTypeDefs[typePath as string]
    const value = fieldOverride
      ? fieldOverride.value
      : converter.revert(
        accessor != null
          ? accessor.value
          : fieldTypeDef != null
          ? mobxCopy(
            fieldTypeDef,
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            valueFactory.create(valuePath as string, this.fields),
          )
          // fake values can't be copied
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          : valueFactory.create(valuePath as string, this.fields),
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        valuePath as string,
      )
    const error = this.errors[valuePath]
    return {
      value,
      error,
      // if we can't write it back, then we have to disable it
      disabled: this.isDisabled(valuePath),
      required: this.isRequired(valuePath),
    }
  }

  getAccessorForValuePath(valuePath: keyof ValuePathsToAdapters): Accessor | undefined {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return this.accessors[valuePath as string]
  }

  @computed
  // should only be referenced internally, so loosely typed
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get accessors(): Readonly<Record<string, Accessor<any>>> {
    // TODO flatten mobx accessors of actually!
    return flattenAccessorsOf<T, Readonly<Record<string, Accessor>>>(
      this.typeDef,
      this.value,
      (value: ValueTypeOf<T>): void => {
        this.value = mobxCopy(this.typeDef, value)
      },
    )
  }

  protected isDisabled(_valuePath: keyof ValuePathsToAdapters): boolean {
    // TODO infer from types
    return false
  }

  protected isRequired(_valuePath: keyof ValuePathsToAdapters): boolean {
    // TODO infer from types
    return false
  }
}

import {
  assertExists,
  assertExistsAndReturn,
  assertState,
  checkValidNumber,
  type ElementOfArray,
  type Maybe,
  toArray,
  UnreachableError,
} from '@strictly/base'
import {
  type Accessor,
  type AnyValueType,
  flattenAccessorsOfType,
  type FlattenedValuesOfType,
  flattenTypesOfType,
  flattenValueTo,
  jsonPathPop,
  mobxCopy,
  type MobxValueTypeOf,
  type ReadonlyTypeOfType,
  type StrictTypeDef,
  type Type,
  type ValueOfType,
  valuePathToTypePath,
} from '@strictly/define'
import {
  computed,
  observable,
  runInAction,
} from 'mobx'
import {
  type ReadonlyDeep,
  type SimplifyDeep,
  type StringKeyOf,
  type ValueOf,
} from 'type-fest'
import {
  type Field,
} from 'types/field'
import {
  FieldConversionResult,
} from 'types/field_converters'
import {
  type ErrorTypeOfFieldAdapter,
  type FieldAdapter,
  type ToTypeOfFieldAdapter,
} from './field_adapter'
import {
  type FlattenedListTypesOfType,
} from './flattened_list_types_of_type'

export type FlattenedConvertedFieldsOf<
  ValuePathsToAdapters extends Readonly<Record<string, FieldAdapter>>,
> = {
  readonly [K in keyof ValuePathsToAdapters]: Field<
    ToTypeOfFieldAdapter<ValuePathsToAdapters[K]>,
    ErrorTypeOfFieldAdapter<ValuePathsToAdapters[K]>
  >
}

export type FlattenedTypePathsToAdaptersOf<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  FlattenedValues extends Readonly<Record<string, any>>,
  Context,
> = {
  readonly [
    K in keyof FlattenedValues
    // TODO would be better to use the equivalent readonly typedef, but it causes typescript to
    // infinitely recurse
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ]?: FieldAdapter<ReadonlyDeep<FlattenedValues[K]>, any, any, any, Context>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FieldOverride<V = any> = {
  value: V,
}

type FlattenedFieldOverrides<
  ValuePathsToAdapters extends Readonly<Record<string, FieldAdapter>>,
> = {
  -readonly [K in keyof ValuePathsToAdapters]?: FieldOverride<
    ToTypeOfFieldAdapter<ValuePathsToAdapters[K]>
  >
}

type FlattenedErrors<
  ValuePathsToAdapters extends Readonly<Record<string, FieldAdapter>>,
> = {
  -readonly [K in keyof ValuePathsToAdapters]?: ErrorTypeOfFieldAdapter<ValuePathsToAdapters[K]>
}

export type ValuePathsToAdaptersOf<
  TypePathsToAdapters extends Partial<Readonly<Record<string, FieldAdapter>>>,
  ValuePathsToTypePaths extends Readonly<Record<string, string>>,
> = keyof TypePathsToAdapters extends ValueOf<ValuePathsToTypePaths> ? {
    readonly [
      K in keyof ValuePathsToTypePaths as unknown extends TypePathsToAdapters[ValuePathsToTypePaths[K]] ? never : K
    ]: NonNullable<TypePathsToAdapters[ValuePathsToTypePaths[K]]>
  }
  : never

export class FormPresenter<
  T extends Type,
  ValueToTypePaths extends Readonly<Record<string, string>>,
  TypePathsToAdapters extends FlattenedTypePathsToAdaptersOf<
    FlattenedValuesOfType<T, '*'>,
    ValueOfType<ReadonlyTypeOfType<T>>
  >,
  ValuePathsToAdapters extends ValuePathsToAdaptersOf<TypePathsToAdapters, ValueToTypePaths> = ValuePathsToAdaptersOf<
    TypePathsToAdapters,
    ValueToTypePaths
  >,
> {
  constructor(
    readonly typeDef: T,
    private readonly adapters: TypePathsToAdapters,
  ) {
  }

  private maybeGetAdapterForValuePath(valuePath: keyof ValuePathsToAdapters) {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const typePath = valuePathToTypePath(this.typeDef, valuePath as string, true)
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

  typePath<K extends keyof ValueToTypePaths>(valuePath: K): ValueToTypePaths[K] {
    return valuePathToTypePath<ValueToTypePaths, K>(this.typeDef, valuePath, true)
  }

  setFieldValueAndValidate<K extends keyof ValuePathsToAdapters>(
    model: FormModel<T, ValueToTypePaths, TypePathsToAdapters, ValuePathsToAdapters>,
    valuePath: K,
    value: ToTypeOfFieldAdapter<ValuePathsToAdapters[K]>,
  ): boolean {
    return this.internalSetFieldValue(model, valuePath, value, true)
  }

  setFieldValue<K extends keyof ValuePathsToAdapters>(
    model: FormModel<T, ValueToTypePaths, TypePathsToAdapters, ValuePathsToAdapters>,
    valuePath: K,
    value: ToTypeOfFieldAdapter<ValuePathsToAdapters[K]>,
  ): boolean {
    return this.internalSetFieldValue(model, valuePath, value, false)
  }

  addListItem<K extends keyof FlattenedListTypesOfType<T>>(
    model: FormModel<T, ValueToTypePaths, TypePathsToAdapters, ValuePathsToAdapters>,
    valuePath: K,
    // TODO can this type be simplified?
    elementValue: Maybe<ElementOfArray<FlattenedValuesOfType<T>[K]>>,
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
      : elementAdapter.create(
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        elementTypePath as string,
        model.value,
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

  removeListItem<K extends keyof FlattenedListTypesOfType<T>>(
    model: FormModel<T, ValueToTypePaths, TypePathsToAdapters, ValuePathsToAdapters>,
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
      return index > elementIndex
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
    model: FormModel<T, ValueToTypePaths, TypePathsToAdapters, ValuePathsToAdapters>,
    valuePath: K,
    value: ToTypeOfFieldAdapter<ValuePathsToAdapters[K]>,
    displayValidation: boolean,
  ): boolean {
    const { revert } = this.getAdapterForValuePath(valuePath)

    assertExists(revert, 'setting value not supported {}', valuePath)

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any
    const conversion = revert(value, valuePath as any, model.value)
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
    model: FormModel<T, ValueToTypePaths, TypePathsToAdapters, ValuePathsToAdapters>,
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
    model: FormModel<T, ValueToTypePaths, TypePathsToAdapters, ValuePathsToAdapters>,
    valuePath: K,
  ) {
    const typePath = this.typePath(valuePath)
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const adapter = this.adapters[typePath as keyof TypePathsToAdapters]
    if (adapter == null) {
      return
    }
    const {
      convert,
      create,
    } = adapter
    const accessor = model.accessors[valuePath]
    const value = accessor == null ? create(valuePath, model.value) : accessor.value
    const displayValue = convert(value, valuePath, model.value)
    runInAction(function () {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      model.fieldOverrides[valuePath as unknown as keyof ValuePathsToAdapters] = {
        value: displayValue,
      }
    })
  }

  clearAll(
    model: FormModel<T, ValueToTypePaths, TypePathsToAdapters, ValuePathsToAdapters>,
    value: ValueOfType<T>,
  ): void {
    runInAction(() => {
      model.errors = {}
      // TODO this isn't correct, should reload from value
      model.fieldOverrides = {}
      model.value = mobxCopy(this.typeDef, value)
    })
  }

  validateField<K extends keyof ValuePathsToAdapters>(
    model: FormModel<T, ValueToTypePaths, TypePathsToAdapters, ValuePathsToAdapters>,
    valuePath: K,
  ): boolean {
    const {
      convert,
      revert,
      create,
    } = this.getAdapterForValuePath(valuePath)
    const fieldOverride = model.fieldOverrides[valuePath]
    const accessor = model.getAccessorForValuePath(valuePath)
    const storedValue = convert(
      accessor != null
        ? accessor.value
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        : create(valuePath as string, model.value),
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      valuePath as string,
      model.value,
    )
    const value = fieldOverride != null
      ? fieldOverride.value
      : storedValue
    const dirty = storedValue !== value
    assertExists(revert, 'changing field directly not supported {}', valuePath)

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const conversion = revert(value, valuePath as string, model.value)
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

  validateAll(model: FormModel<T, ValueToTypePaths, TypePathsToAdapters, ValuePathsToAdapters>): boolean {
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
            convert,
            revert,
          } = adapter
          if (revert == null) {
            // no convert method means this field is immutable
            return success
          }
          const fieldOverride = model.fieldOverrides[adapterPath]
          const storedValue = convert(accessor.value, valuePath, model.value)
          const value = fieldOverride != null
            ? fieldOverride.value
            : storedValue
          // TODO more nuanced comparison
          const dirty = fieldOverride != null && fieldOverride.value !== storedValue

          const conversion = revert(value, valuePath, model.value)
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

  createModel(value: ValueOfType<ReadonlyTypeOfType<T>>): FormModel<
    T,
    ValueToTypePaths,
    TypePathsToAdapters,
    ValuePathsToAdapters
  > {
    return new FormModel<T, ValueToTypePaths, TypePathsToAdapters, ValuePathsToAdapters>(
      this.typeDef,
      value,
      this.adapters,
    )
  }
}

export class FormModel<
  T extends Type,
  ValueToTypePaths extends Readonly<Record<string, string>>,
  TypePathsToAdapters extends FlattenedTypePathsToAdaptersOf<
    FlattenedValuesOfType<T, '*'>,
    ValueOfType<ReadonlyTypeOfType<T>>
  >,
  ValuePathsToAdapters extends ValuePathsToAdaptersOf<TypePathsToAdapters, ValueToTypePaths> = ValuePathsToAdaptersOf<
    TypePathsToAdapters,
    ValueToTypePaths
  >,
> {
  @observable.ref
  accessor value: MobxValueTypeOf<T>
  @observable.shallow
  accessor fieldOverrides: FlattenedFieldOverrides<ValuePathsToAdapters>
  @observable.shallow
  accessor errors: FlattenedErrors<ValuePathsToAdapters> = {}

  private readonly flattenedTypeDefs: Readonly<Record<string, Type>>

  constructor(
    private readonly type: T,
    value: ValueOfType<ReadonlyTypeOfType<T>>,
    private readonly adapters: TypePathsToAdapters,
  ) {
    this.value = mobxCopy(type, value)
    this.flattenedTypeDefs = flattenTypesOfType(type)
    // pre-populate field overrides for consistent behavior when default information is overwritten
    // then returned to
    this.fieldOverrides = flattenValueTo(
      type,
      this.value,
      () => {},
      (_t: StrictTypeDef, value: AnyValueType, _setter, typePath, valuePath): FieldOverride | undefined => {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const adapter = this.adapters[typePath as keyof TypePathsToAdapters]
        if (adapter == null) {
          return
        }
        const {
          convert,
          revert,
        } = adapter
        if (revert == null) {
          // no need to store a temporary value if the value cannot be written back
          return
        }
        const displayValue = convert(value, valuePath, this.value)
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
    return flattenValueTo(
      this.type,
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
      typePath = valuePathToTypePath<ValueToTypePaths, keyof ValueToTypePaths>(
        this.type,
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        valuePath as keyof ValueToTypePaths,
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
      convert,
      create,
    } = adapter

    const fieldOverride = this.fieldOverrides[valuePath]
    const accessor = this.getAccessorForValuePath(valuePath)
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const fieldTypeDef = this.flattenedTypeDefs[typePath as string]
    const value = fieldOverride
      ? fieldOverride.value
      : convert(
        accessor != null
          ? accessor.value
          : fieldTypeDef != null
          ? mobxCopy(
            fieldTypeDef,
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            create(valuePath as string, this.value),
          )
          // fake values can't be copied
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          : create(valuePath as string, this.value),
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        valuePath as string,
        this.value,
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
  get accessors(): Readonly<Record<string, Accessor>> {
    return flattenAccessorsOfType<T, Readonly<Record<string, Accessor>>>(
      this.type,
      this.value,
      (value: ValueOfType<T>): void => {
        this.value = mobxCopy(this.type, value)
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

import {
  assertExists,
  assertExistsAndReturn,
  assertState,
  checkValidNumber,
  type ElementOfArray,
  map,
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
  flattenValuesOfType,
  flattenValueTo,
  jsonPathPop,
  mobxCopy,
  type MobxValueOfType,
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
  type UnionToIntersection,
  type ValueOf,
} from 'type-fest'
import {
  type Field,
} from 'types/field'
import {
  type AnnotatedFieldConversion,
  UnreliableFieldConversionType,
} from 'types/field_converters'
import {
  type ContextOfFieldAdapter,
  type ErrorOfFieldAdapter,
  type FieldAdapter,
  type ToOfFieldAdapter,
} from './field_adapter'
import {
  type FlattenedListTypesOfType,
} from './flattened_list_types_of_type'

export type FlattenedConvertedFieldsOf<
  ValuePathsToAdapters extends Readonly<Record<string, FieldAdapter>>,
> = {
  readonly [K in keyof ValuePathsToAdapters]: Field<
    ToOfFieldAdapter<ValuePathsToAdapters[K]>,
    ErrorOfFieldAdapter<ValuePathsToAdapters[K]>
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
type FieldOverride<V = any> = Maybe<V>

type FlattenedFieldOverrides<
  ValuePathsToAdapters extends Readonly<Record<string, FieldAdapter>>,
> = {
  -readonly [K in keyof ValuePathsToAdapters]?: FieldOverride<
    ToOfFieldAdapter<ValuePathsToAdapters[K]>
  >
}

type FlattenedErrors<
  ValuePathsToAdapters extends Readonly<Record<string, FieldAdapter>>,
> = {
  -readonly [K in keyof ValuePathsToAdapters]?: ErrorOfFieldAdapter<ValuePathsToAdapters[K]>
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

export type ContextOf<TypePathsToAdapters extends Partial<Readonly<Record<string, FieldAdapter>>>> =
  UnionToIntersection<
    | {
      readonly [
        K in keyof TypePathsToAdapters
      ]: TypePathsToAdapters[K] extends undefined ? undefined
        // ignore unspecified values
        : unknown extends ContextOfFieldAdapter<NonNullable<TypePathsToAdapters[K]>> ? never
        : ContextOfFieldAdapter<NonNullable<TypePathsToAdapters[K]>>
    }[keyof TypePathsToAdapters]
    // ensure we have at least one thing to intersect (can end up with a `never` context otherwise)
    | {}
  >

export type FormMode = 'edit' | 'create'

export abstract class FormModel<
  T extends Type,
  ValueToTypePaths extends Readonly<Record<string, string>>,
  TypePathsToAdapters extends FlattenedTypePathsToAdaptersOf<
    FlattenedValuesOfType<T, '*'>,
    ContextType
  >,
  ContextType = ContextOf<TypePathsToAdapters>,
  ValuePathsToAdapters extends ValuePathsToAdaptersOf<TypePathsToAdapters, ValueToTypePaths> = ValuePathsToAdaptersOf<
    TypePathsToAdapters,
    ValueToTypePaths
  >,
> {
  @observable.ref
  accessor value: MobxValueOfType<T>
  @observable.shallow
  accessor fieldOverrides: FlattenedFieldOverrides<ValuePathsToAdapters>
  @observable.shallow
  accessor errors: FlattenedErrors<ValuePathsToAdapters> = {}

  private readonly flattenedTypeDefs: Readonly<Record<string, Type>>

  constructor(
    readonly type: T,
    private readonly originalValue: ValueOfType<ReadonlyTypeOfType<T>>,
    protected readonly adapters: TypePathsToAdapters,
    protected readonly mode: FormMode,
  ) {
    this.value = mobxCopy(type, originalValue)
    this.flattenedTypeDefs = flattenTypesOfType(type)
    // pre-populate field overrides for consistent behavior when default information is overwritten
    // then returned to
    const conversions = flattenValueTo(
      type,
      this.value,
      () => {},
      (
        _t: StrictTypeDef,
        fieldValue: AnyValueType,
        _setter,
        typePath,
        valuePath,
      ): AnnotatedFieldConversion<FieldOverride> | undefined => {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const contextValue = this.toContext(originalValue, valuePath as keyof ValuePathsToAdapters)

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
        // cannot call this.context yet as the "this" pointer has not been fully created
        return convert(fieldValue, valuePath, contextValue)
      },
    )
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    this.fieldOverrides = map(conversions, function (_k, v) {
      return v && [v.value]
    }) as FlattenedFieldOverrides<ValuePathsToAdapters>
  }

  protected abstract toContext(
    value: ValueOfType<ReadonlyTypeOfType<T>>,
    valuePath: keyof ValuePathsToAdapters,
  ): ContextType

  get forceMutableFields() {
    switch (this.mode) {
      case 'create':
        return true
      case 'edit':
        return false
      default:
        return this.mode satisfies never
    }
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
    const context = this.toContext(this.value, valuePath)
    const {
      value,
      required,
      readonly,
    } = convert(
      accessor != null
        ? accessor.value
        : fieldTypeDef != null
        ? mobxCopy(
          fieldTypeDef,
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          create(valuePath as string, context),
        )
        // fake values can't be copied
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        : create(valuePath as string, context),
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      valuePath as string,
      context,
    )
    const error = this.errors[valuePath]
    return {
      value: fieldOverride != null ? fieldOverride[0] : value,
      error,
      readonly: readonly && !this.forceMutableFields,
      required,
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

  private maybeGetAdapterForValuePath(valuePath: keyof ValuePathsToAdapters) {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const typePath = valuePathToTypePath(this.type, valuePath as string, true)
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
    return valuePathToTypePath<ValueToTypePaths, K>(this.type, valuePath, true)
  }

  setFieldValueAndValidate<K extends keyof ValuePathsToAdapters>(
    valuePath: K,
    value: ToOfFieldAdapter<ValuePathsToAdapters[K]>,
  ): boolean {
    return this.internalSetFieldValue(valuePath, value, true)
  }

  setFieldValue<K extends keyof ValuePathsToAdapters>(
    valuePath: K,
    value: ToOfFieldAdapter<ValuePathsToAdapters[K]>,
  ): boolean {
    return this.internalSetFieldValue(valuePath, value, false)
  }

  addListItem<K extends keyof FlattenedListTypesOfType<T>>(
    valuePath: K,
    // TODO can this type be simplified?
    elementValue: Maybe<ElementOfArray<FlattenedValuesOfType<T>[K]>> = null,
    index?: number,
  ) {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const listValuePath = valuePath as string
    const accessor = this.accessors[valuePath]
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
        // TODO what can we use for the value path here?
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        this.toContext(this.value, valuePath as unknown as keyof ValuePathsToAdapters),
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
    const targetPaths = Object.keys(this.fieldOverrides).filter(function (v) {
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
    runInAction(() => {
      targetPaths.forEach(([
        index,
        postfix,
      ]) => {
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
        const fieldOverride = this.fieldOverrides[fromJsonPath]
        delete this.fieldOverrides[fromJsonPath]
        this.fieldOverrides[toJsonPath] = fieldOverride
        const error = this.errors[fromJsonPath]
        delete this.errors[fromJsonPath]
        this.errors[toJsonPath] = error
      })
      accessor.set(newList)
      // delete any value overrides so the new list isn't shadowed
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      delete this.fieldOverrides[listValuePath as keyof ValuePathsToAdapters]
    })
  }

  removeListItem<K extends keyof FlattenedListTypesOfType<T>>(...elementValuePaths: readonly `${K}.${number}`[]) {
    // sort and reverse so we delete last to first so indices of sequential deletions are preserved
    const orderedElementValuePaths = elementValuePaths.toSorted().reverse()
    runInAction(() => {
      orderedElementValuePaths.forEach(elementValuePath => {
        const [
          listValuePath,
          elementIndexString,
        ] = assertExistsAndReturn(
          jsonPathPop(elementValuePath),
          'expected a path with two or more segments {}',
          elementValuePath,
        )
        const accessor = this.accessors[listValuePath]
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
        const targetPaths = Object.keys(this.fieldOverrides).filter(function (v) {
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
          // descending
          return a - b
        })

        targetPaths.forEach(([
          index,
          postfix,
        ]) => {
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
          const fieldOverride = this.fieldOverrides[fromJsonPath]
          delete this.fieldOverrides[fromJsonPath]
          this.fieldOverrides[toJsonPath] = fieldOverride
          const error = this.errors[fromJsonPath]
          delete this.errors[fromJsonPath]
          this.errors[toJsonPath] = error
        })
        accessor.set(newList)
        // delete any value overrides so the new list isn't shadowed
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        delete this.fieldOverrides[listValuePath as keyof ValuePathsToAdapters]
      })
    })
  }

  private internalSetFieldValue<K extends keyof ValuePathsToAdapters>(
    valuePath: K,
    value: ToOfFieldAdapter<ValuePathsToAdapters[K]>,
    displayValidation: boolean,
  ): boolean {
    const { revert } = this.getAdapterForValuePath(valuePath)

    assertExists(revert, 'setting value not supported {}', valuePath)

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any
    const conversion = revert(value, valuePath as any, this.toContext(this.value, valuePath))
    const accessor = this.getAccessorForValuePath(valuePath)
    return runInAction(() => {
      this.fieldOverrides[valuePath] = [value]
      switch (conversion.type) {
        case UnreliableFieldConversionType.Failure:
          if (displayValidation) {
            this.errors[valuePath] = conversion.error
          }
          if (conversion.value != null && accessor != null) {
            accessor.set(conversion.value[0])
          }
          return false
        case UnreliableFieldConversionType.Success:
          delete this.errors[valuePath]
          accessor?.set(conversion.value)
          return true
        default:
          throw new UnreachableError(conversion)
      }
    })
  }

  clearFieldError<K extends keyof ValuePathsToAdapters>(valuePath: K) {
    const fieldOverride = this.fieldOverrides[valuePath]
    if (fieldOverride != null) {
      runInAction(() => {
        delete this.errors[valuePath]
      })
    }
  }

  clearFieldValue<K extends StringKeyOf<ValuePathsToAdapters>>(valuePath: K) {
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
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const context = this.toContext(this.value, valuePath as unknown as keyof ValuePathsToAdapters)
    const value = create(valuePath, context)
    const {
      value: displayValue,
    } = convert(value, valuePath, context)
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const key = valuePath as unknown as keyof ValuePathsToAdapters
    runInAction(() => {
      this.fieldOverrides[key] = [displayValue]
    })
  }

  clearAll(value: ValueOfType<T>): void {
    runInAction(() => {
      this.errors = {}
      // TODO this isn't correct, should reload from value
      this.fieldOverrides = {}
      this.value = mobxCopy(this.type, value)
    })
  }

  isValuePathActive<K extends keyof ValuePathsToAdapters>(valuePath: K): boolean {
    const values = flattenValuesOfType(this.type, this.value)
    const keys = new Set(Object.keys(values))
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return keys.has(valuePath as string)
  }

  validateField<K extends keyof ValuePathsToAdapters>(
    valuePath: K,
    ignoreDefaultValue = false,
  ): boolean {
    const {
      convert,
      revert,
      create,
    } = this.getAdapterForValuePath(valuePath)
    const fieldOverride = this.fieldOverrides[valuePath]
    const accessor = this.getAccessorForValuePath(valuePath)
    const context = this.toContext(this.value, valuePath)

    const {
      value: storedValue,
    } = convert(
      accessor != null
        ? accessor.value
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        : create(valuePath as string, context),
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      valuePath as string,
      context,
    )
    const value = fieldOverride != null
      ? fieldOverride[0]
      : storedValue
    const dirty = storedValue !== value
    assertExists(revert, 'changing field directly not supported {}', valuePath)
    if (ignoreDefaultValue) {
      const {
        value: defaultDisplayValue,
      } = convert(create(valuePath, context), valuePath, context)
      if (defaultDisplayValue === value) {
        return true
      }
    }
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const conversion = revert(value, valuePath as string, context)
    return runInAction(() => {
      switch (conversion.type) {
        case UnreliableFieldConversionType.Failure:
          this.errors[valuePath] = conversion.error
          if (conversion.value != null && accessor != null && dirty) {
            accessor.set(conversion.value[0])
          }
          return false
        case UnreliableFieldConversionType.Success:
          delete this.errors[valuePath]
          if (accessor != null && dirty) {
            accessor.set(conversion.value)
          }
          return true
        default:
          throw new UnreachableError(conversion)
      }
    })
  }

  validateAll(force: boolean = this.mode === 'create'): boolean {
    // sort keys shortest to longest so parent changes don't overwrite child changes
    const accessors = toArray(this.accessors).toSorted(function ([a], [b]) {
      return a.length - b.length
    })

    const flattenedOriginalValues = flattenValuesOfType(this.type, this.originalValue)

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
          const fieldOverride = this.fieldOverrides[adapterPath]
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          const context = this.toContext(this.value, valuePath as keyof ValuePathsToAdapters)
          const {
            value: storedValue,
          } = convert(accessor.value, valuePath, context)
          const value = fieldOverride != null
            ? fieldOverride[0]
            : storedValue
          // TODO customizable comparisons
          const dirty = fieldOverride != null && fieldOverride[0] !== storedValue
          const needsValidation = force
            || !(valuePath in flattenedOriginalValues)
            || storedValue !== convert(
                flattenedOriginalValues[valuePath],
                valuePath,
                // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                this.toContext(this.originalValue, valuePath as keyof ValuePathsToAdapters),
              ).value
          if (needsValidation) {
            const conversion = revert(value, valuePath, context)
            switch (conversion.type) {
              case UnreliableFieldConversionType.Failure:
                this.errors[adapterPath] = conversion.error
                if (conversion.value != null && dirty) {
                  accessor.set(conversion.value[0])
                }
                return false
              case UnreliableFieldConversionType.Success:
                if (dirty) {
                  accessor.set(conversion.value)
                }
                delete this.errors[adapterPath]
                return success
              default:
                throw new UnreachableError(conversion)
            }
          }
          return success
        },
        true,
      )
    })
  }
}

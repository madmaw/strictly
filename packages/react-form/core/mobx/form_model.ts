import {
  assertExists,
  assertExistsAndReturn,
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
  equals,
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

type FlattenedErrorOverrides<
  ValuePathsToAdapters extends Readonly<Record<string, FieldAdapter>>,
> = {
  -readonly [K in keyof ValuePathsToAdapters]?: ErrorOfFieldAdapter<ValuePathsToAdapters[K]>
}

export enum Validation {
  None = 0,
  Changed = 1,
  Always = 2,
}

type FlattenedValidation<
  ValuePathsToAdapters extends Readonly<Record<string, FieldAdapter>>,
> = {
  -readonly [K in keyof ValuePathsToAdapters]?: Validation
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
  accessor errorOverrides: FlattenedErrorOverrides<ValuePathsToAdapters> = {}
  @observable.shallow
  accessor validation: FlattenedValidation<ValuePathsToAdapters> = {}

  private readonly flattenedTypeDefs: Readonly<Record<string, Type>>

  // cannot be type safe
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly originalValues: Record<string, any>

  // maintains the value paths of lists when the original order is destroyed by deletes or reordering
  private readonly listIndicesToKeys: Record<string, number[]> = {}

  constructor(
    readonly type: T,
    private readonly originalValue: ValueOfType<ReadonlyTypeOfType<T>>,
    protected readonly adapters: TypePathsToAdapters,
    protected readonly mode: FormMode,
  ) {
    this.originalValues = flattenValuesOfType<ReadonlyTypeOfType<T>>(type, originalValue, this.listIndicesToKeys)
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
      this.listIndicesToKeys,
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
        throw new UnreachableError(this.mode)
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
      this.listIndicesToKeys,
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

  private getField(valuePath: keyof ValuePathsToAdapters, typePath: keyof TypePathsToAdapters) {
    const adapter = this.adapters[typePath]
    if (adapter == null) {
      // invalid path, which can happen
      return
    }
    const {
      convert,
      create,
      revert,
    } = adapter

    const fieldOverride = this.fieldOverrides[valuePath]
    const accessor = this.getAccessorForValuePath(valuePath)
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const fieldTypeDef = this.flattenedTypeDefs[typePath as string]
    const context = this.toContext(this.value, valuePath)
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const defaultValue = create(valuePath as string, context)

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
          defaultValue,
        )
        // fake values can't be copied
        : defaultValue,
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      valuePath as string,
      context,
    )
    const displayedValue = fieldOverride != null ? fieldOverride[0] : value

    return {
      context,
      convert,
      create,
      revert,
      displayedValue,
      // value,
      required,
      readonly,
      defaultValue,
    }
  }

  private synthesizeFieldByPaths(
    valuePath: keyof ValuePathsToAdapters,
    typePath: keyof TypePathsToAdapters,
  ): Field | undefined {
    const field = this.getField(valuePath, typePath)
    if (field == null) {
      return
    }
    const {
      context,
      convert,
      revert,
      displayedValue,
      required,
      readonly,
      defaultValue,
    } = field
    const validation = this.validation[valuePath] ?? Validation.None
    let error: unknown = this.errorOverrides[valuePath]
    if (error == null) {
      switch (validation) {
        case Validation.None:
          // skip validation
          break
        case Validation.Changed:
          if (revert != null) {
            const originalValue = valuePath in this.originalValues
              // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
              ? this.originalValues[valuePath as string]
              : defaultValue
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            const { value: originalDisplayedValue } = convert(originalValue, valuePath as string, context)
            // TODO better comparisons, displayed values can still be complex
            if (displayedValue !== originalDisplayedValue) {
              const revertResult = revert(displayedValue, valuePath, context)
              if (revertResult?.type === UnreliableFieldConversionType.Failure) {
                ;({ error } = revertResult)
              }
            }
          }
          break
        case Validation.Always:
          {
            const revertResult = revert?.(displayedValue, valuePath, context)
            if (revertResult?.type === UnreliableFieldConversionType.Failure) {
              ;({ error } = revertResult)
            }
          }
          break
        default:
          throw new UnreachableError(validation)
      }
    }

    return {
      value: displayedValue,
      error,
      readonly: readonly && !this.forceMutableFields,
      required,
      // make a copy of the index mapping and remove the final value (next id)
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      listIndexToKey: this.listIndicesToKeys[valuePath as string]?.slice(0, -1),
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
      this.listIndicesToKeys,
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

  @computed
  get dirty() {
    return Object.keys(this.accessors).some((valuePath) => {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return this.isFieldDirty(valuePath as keyof ValuePathsToAdapters)
    })
  }

  @computed
  get valueChanged() {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return !equals(this.type, this.value, this.originalValue as ValueOfType<T>)
  }

  typePath<K extends keyof ValueToTypePaths>(valuePath: K): ValueToTypePaths[K] {
    return valuePathToTypePath<ValueToTypePaths, K>(this.type, valuePath, true)
  }

  setFieldValue<K extends keyof ValuePathsToAdapters>(
    valuePath: K,
    value: ToOfFieldAdapter<ValuePathsToAdapters[K]>,
    validation?: Validation,
  ): boolean {
    return this.internalSetFieldValue(valuePath, value, validation)
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
    runInAction(() => {
      accessor.set(newList)
      // delete any value overrides so the new list isn't shadowed
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      delete this.fieldOverrides[listValuePath as keyof ValuePathsToAdapters]
      const indicesToKeys = assertExistsAndReturn(
        this.listIndicesToKeys[listValuePath],
        'no index to key mapping for list {}',
        listValuePath,
      )
      const nextKey = indicesToKeys[indicesToKeys.length - 1]
      // insert the next key
      indicesToKeys.splice(definedIndex, 0, nextKey)
      // create the new next key
      indicesToKeys[indicesToKeys.length - 1] = nextKey + 1
    })
  }

  removeListItem<K extends keyof FlattenedListTypesOfType<T>>(...elementValuePaths: readonly `${K}.${number}`[]) {
    runInAction(() => {
      elementValuePaths.forEach(elementValuePath => {
        const [
          listValuePath,
          elementKeyString,
        ] = assertExistsAndReturn(
          jsonPathPop(elementValuePath),
          'expected a path with two or more segments {}',
          elementValuePath,
        )
        const accessor = this.accessors[listValuePath]
        const elementKey = checkValidNumber(
          parseInt(elementKeyString),
          'unexpected id {} ({})',
          elementKeyString,
          elementValuePath,
        )
        const indicesToKeys = this.listIndicesToKeys[listValuePath]
        const elementIndex = indicesToKeys?.indexOf(elementKey) ?? -1
        if (elementIndex >= 0) {
          const newList = [...accessor.value]
          newList.splice(elementIndex, 1)
          accessor.set(newList)
          // delete any value overrides so the new list isn't shadowed
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          delete this.fieldOverrides[listValuePath as keyof ValuePathsToAdapters]
          indicesToKeys.splice(elementIndex, 1)
        }
      })
    })
  }

  private internalSetFieldValue<K extends keyof ValuePathsToAdapters>(
    valuePath: K,
    value: ToOfFieldAdapter<ValuePathsToAdapters[K]>,
    validation: Validation | undefined,
  ): boolean {
    const { revert } = this.getAdapterForValuePath(valuePath)

    assertExists(revert, 'setting value not supported {}', valuePath)

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any
    const conversion = revert(value, valuePath as any, this.toContext(this.value, valuePath))
    const accessor = this.getAccessorForValuePath(valuePath)
    return runInAction(() => {
      this.fieldOverrides[valuePath] = [value]
      delete this.errorOverrides[valuePath]
      if (validation != null) {
        this.validation[valuePath] = validation
      }
      switch (conversion.type) {
        case UnreliableFieldConversionType.Failure:
          if (conversion.value != null && accessor != null) {
            accessor.set(conversion.value[0])
          }
          return false
        case UnreliableFieldConversionType.Success:
          accessor?.set(conversion.value)
          return true
        default:
          throw new UnreachableError(conversion)
      }
    })
  }

  /**
   * Forces an error onto a field. Error will be removed if the field value changes
   * @param valuePath the field to display an error for
   * @param error the error to display
   */
  overrideFieldError<K extends keyof ValuePathsToAdapters>(
    valuePath: K,
    error?: ErrorOfFieldAdapter<ValuePathsToAdapters[K]>,
  ) {
    runInAction(() => {
      if (error) {
        this.errorOverrides[valuePath] = error
      } else {
        delete this.errorOverrides[valuePath]
      }
    })
  }

  clearFieldError<K extends keyof ValuePathsToAdapters>(valuePath: K) {
    const fieldOverride = this.fieldOverrides[valuePath]
    if (fieldOverride != null) {
      runInAction(() => {
        delete this.validation[valuePath]
        delete this.errorOverrides[valuePath]
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
      delete this.validation[key]
      delete this.errorOverrides[key]
    })
  }

  clearAll(value: ValueOfType<T>): void {
    runInAction(() => {
      this.validation = {}
      // TODO this isn't correct, should reload from value
      this.fieldOverrides = {}
      this.errorOverrides = {}
      this.value = mobxCopy(this.type, value)
    })
  }

  isValuePathActive<K extends keyof ValuePathsToAdapters>(valuePath: K): boolean {
    const values = flattenValuesOfType(this.type, this.value, this.listIndicesToKeys)
    const keys = new Set(Object.keys(values))
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return keys.has(valuePath as string)
  }

  getValidation<K extends keyof ValuePathsToAdapters>(valuePath: K): Validation {
    return this.validation[valuePath] ?? Validation.None
  }

  isFieldDirty<K extends keyof ValuePathsToAdapters>(valuePath: K): boolean {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const typePath = valuePathToTypePath<ValueToTypePaths, keyof ValueToTypePaths>(
      this.type,
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      valuePath as keyof ValueToTypePaths,
      true,
    ) as keyof TypePathsToAdapters
    const field = this.getField(valuePath, typePath)

    if (field == null) {
      return false
    }

    const {
      displayedValue,
      convert,
      revert,
      context,
      defaultValue,
    } = field

    // if either the display value, or the stored value, match the original, then assume it's not dirty
    const originalValue = valuePath in this.originalValues
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      ? this.originalValues[valuePath as string]
      : defaultValue
    if (revert != null) {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const typeDef = this.flattenedTypeDefs[typePath as string]
      const {
        value,
        type,
      } = revert(displayedValue, valuePath, context)
      if (type === UnreliableFieldConversionType.Success) {
        if (equals(typeDef, originalValue, value)) {
          return false
        }
      }
    }
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const { value: originalDisplayedValue } = convert(originalValue, valuePath as string, context)
    // try to compare the displayed values directly if we can't revert the displayed value
    return displayedValue !== originalDisplayedValue
  }

  validateField<K extends keyof ValuePathsToAdapters>(
    valuePath: K,
    validation: Validation = Validation.Always,
  ): boolean {
    runInAction(() => {
      this.validation[valuePath] = validation
      delete this.errorOverrides[valuePath]
    })
    return this.fields[valuePath].error == null
  }

  validateAll(validation: Validation = Validation.Always): boolean {
    const accessors = toArray(this.accessors)

    runInAction(() => {
      accessors.forEach(([valuePath]) => {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        this.validation[valuePath as keyof ValuePathsToAdapters] = validation
      })
    })
    return accessors.every(
      ([valuePath]): boolean => {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const field = this.fields[valuePath as keyof ValuePathsToAdapters]
        return field?.error == null
      },
    )
  }

  validateSubmit() {
    return this.validateAll()
  }
}

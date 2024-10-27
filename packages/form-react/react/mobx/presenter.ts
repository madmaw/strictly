import {
  type InternalValueTypeOf,
  type TypeDef,
} from '@de/fine'
import { type ReadonlyRecord } from '@de/fine/util/record'
import { type FormField } from 'react/props'

// sets and sets the value into the original object
type Accessor<V> = {
  get(): V,
  set(v: V): void,
}

type FlattenedAccessorsOf<
  JsonPaths extends ReadonlyRecord<string, keyof Fields>,
  Fields extends ReadonlyRecord<string, TypeDef>,
> = {
  [K in keyof JsonPaths]: Accessor<InternalValueTypeOf<Fields[JsonPaths[K]]>>
}

type Conversion<V, E> = {
  value: V,
  error?: E,
}

// convert to the model type from the display type
// for example a text field that renders an integer would have
// a `from` type of `string`, and a `to` type of `number`
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Converter<E, From = any, To = any> = {
  convert(from: From): Conversion<To, E>,
  revert(to: To): From,
}

type FlattenedConvertersOf<Fields extends ReadonlyRecord<string, TypeDef>, E> = {
  [K in keyof Fields]: Converter<
    E,
    InternalValueTypeOf<Fields[K]>
  >
}

type FlattenedFieldsOf<
  JsonPaths extends ReadonlyRecord<string, keyof Converters>,
  Converters extends Record<string, Converter<E>>,
  E,
> = {
  [K in keyof JsonPaths]: FormField<ReturnType<Converters[JsonPaths[K]]['revert']>, E>
}

type FieldOverride<E, V> = {
  error?: E,
  overrideValue: V,
  dirty: boolean,
}

type FlattenedFieldOverrides<
  E,
  JsonPaths extends ReadonlyRecord<string, keyof Converters>,
  Converters extends Record<string, Converter<E>>,
> = Partial<{
  [K in keyof JsonPaths]: FieldOverride<E, ReturnType<Converters[JsonPaths[K]]['revert']>>
}>

export class FormPresenter<
  T extends TypeDef,
  E extends NonNullable<object>,
  FieldTypeDefs extends ReadonlyRecord<string, TypeDef>,
  JsonPaths extends ReadonlyRecord<string, keyof FieldTypeDefs>,
  Converters extends FlattenedConvertersOf<FieldTypeDefs, E>,
> {
  constructor() {
  }

  onFieldValueChange<K extends keyof JsonPaths>(
    model: FormModel<T, E, FieldTypeDefs, JsonPaths, Converters>,
    key: K,
    value: ReturnType<Converters[JsonPaths[K]]['revert']>,
  ): void {
  }

  onFieldFocus(
    model: FormModel<T, E, FieldTypeDefs, JsonPaths, Converters>,
    key: keyof JsonPaths,
  ): void {
  }

  onFieldBlur(
    model: FormModel<T, E, FieldTypeDefs, JsonPaths, Converters>,
    key: keyof JsonPaths,
  ): void {
  }

  validate(model: FormModel<T, E, FieldTypeDefs, JsonPaths, Converters>) {
  }
}

export class FormModel<
  T extends TypeDef,
  E,
  FieldTypeDefs extends ReadonlyRecord<string, TypeDef>,
  JsonPaths extends ReadonlyRecord<string, keyof FieldTypeDefs>,
  Converters extends FlattenedConvertersOf<FieldTypeDefs, E>,
> {
  value: InternalValueTypeOf<T>
  fieldOverrides: FlattenedFieldOverrides<E, JsonPaths, Converters> = {}

  constructor(
    private readonly typeDef: T,
    value: InternalValueTypeOf<T>,
    private readonly converters: Converters,
  ) {
    this.value = value
  }

  get accessors(): FlattenedAccessorsOf<JsonPaths, FieldTypeDefs> {
    // get the accessor
    // TODO
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-unsafe-return
    return {} as any
  }

  get fields(): FlattenedFieldsOf<JsonPaths, Converters, E> {
    // combine accessor and field overrides into a field object that can be passed as a prop
    // TODO
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-unsafe-return
    return {} as any
  }
}

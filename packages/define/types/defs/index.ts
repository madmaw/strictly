import { type ReadonlyRecord } from 'util/record'

// NOTE: this file, in conjunction with the types that derive information from these types, pushes the
// Typescript compiler to its absolute limit. It tends to be a death of 1000 cuts so no individual feature
// breaks it. When combined they hit some threshold (memory? performance? time?) beyond which the compiler
// gives up. To avoid problems try to follow these guidelines
// 1. Keep types as simple as possible.
// If you find yourself having to unwrap a bunch of boolean flags (for example) you're probably going to encounter issues
// 2. Only expose externally, and pass internally, the absolute minimum information information you need
// TS tends to get overwhelmed, where you can, narrow the types that are being returned to just the information
// the caller needs
// 3. Take advantage of helper functions to hide complexity/fragility from client code
// 4. Manually unroll complex operations
// Typescript can choke on things like the below, however you can manually do a full implementation where you
// check each type and return the appropriate value, and that seems to work.
// ```
// type HomogeneousFattenedValue<T extends TypeDef, V> = { [K in keyof FlattenedOf<T>]?: V }
// ```

export type TypeDefHolder<T extends TypeDef = TypeDef> = {
  readonly typeDef: T,
}

export type TypeDef =
  | LiteralTypeDef
  | NullableTypeDef
  | ListTypeDef
  | MapTypeDef
  | ReadonlyTypeDef
  | StructuredTypeDef
  | UnionTypeDef

export enum TypeDefType {
  Literal = 1,
  Nullable,
  List,
  Map,
  Readonly,
  Structured,
  Union,
}

// used to avoid TS complaining about circular references
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyTypeDef = any

// literal
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type LiteralTypeDef<V = any> = {
  readonly type: TypeDefType.Literal,
  // never actually populate
  readonly valuePrototype: V,
}

// nullable
export type NullableTypeDef<
  T extends TypeDef = AnyTypeDef,
> = {
  readonly type: TypeDefType.Nullable,
  readonly toNullableTypeDef: T,
}

// list
export type ListTypeDef<
  E extends TypeDef = AnyTypeDef,
> = {
  readonly type: TypeDefType.List,
  readonly elements: E,
}

// map
export type MapKeyType = string | number

export type MapTypeDef<
  K extends MapKeyType = MapKeyType,
  V extends TypeDef | undefined = AnyTypeDef,
> = {
  readonly type: TypeDefType.Map,
  // never actually populate
  readonly keyPrototype: K,
  readonly valueTypeDef: V,
}

// readonly list or map
export type ReadonlyTypeDef<
  T extends ListTypeDef | MapTypeDef = AnyTypeDef,
> = {
  readonly type: TypeDefType.Readonly,
  readonly toReadonlyTypeDef: T,
}

// structured type
export type StructuredFieldKey = string | number

// NOTE we use the `readonly` and `?` (partial) status of these field definitions
// to describe the same attributes of the fields
export type StructuredTypeDefFields = {
  [Key: StructuredFieldKey]: AnyTypeDef,
}

// NOTE: we cannot collapse this type to
// `StructuredTypeDef = StructuredTypeDefFields`
// as we rely on the `fields` field being unique to discriminate between different
// TypeDefs
export type StructuredTypeDef<
  Fields extends StructuredTypeDefFields = StructuredTypeDefFields,
> = {
  readonly type: TypeDefType.Structured,
  readonly fields: Fields,
}

export type UnionTypeDef<
  U extends ReadonlyRecord<string, AnyTypeDef> = {},
> = {
  readonly type: TypeDefType.Union,
  readonly unions: U,
}

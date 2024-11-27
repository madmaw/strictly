import {
  type IsEqual,
  type Simplify,
} from 'type-fest'
import {
  type MapKeyType,
  type StructuredFieldKey,
  type TypeDefType,
  type UnionKey,
} from './definitions'

// TODO rename to something more descriptive (e.g. introspectable definitions, deterministic
// definitions, discriminated definitions). Maybe should just replace definitions since most
// of the supporting types and utilities don't support non-strict definitions anyway

// strict equivalent of type defs, basically just makes it so Union is introspectable

export type StrictTypeDefHolder<T extends StrictTypeDef = StrictTypeDef> = {
  readonly typeDef: T,
}

export type StrictTypeDef =
  | StrictLiteralTypeDef
  | StrictListTypeDef
  | StrictMapTypeDef
  | StrictStructuredTypeDef
  | StrictUnionTypeDef

// used to avoid TS complaining about circular references
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyTypeDef = any

// literal
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type StrictLiteralTypeDef<V = any> = {
  readonly type: TypeDefType.Literal,
  readonly valuePrototype: [V],
}

// list
export type StrictListTypeDef<
  E extends StrictTypeDef = AnyTypeDef,
> = {
  readonly type: TypeDefType.List,
  // readonly is inherited by the output
  readonly elements: E,
}

// map
export type StrictMapTypeDef<
  K extends MapKeyType = MapKeyType,
  // if `V` includes `undefined` the map is partial
  V extends StrictTypeDef | undefined = AnyTypeDef,
> = {
  readonly type: TypeDefType.Map,
  // never actually populate
  readonly keyPrototype: K,
  // readonly is inherited by the output
  readonly valueTypeDef: V,
}

// structured type

// NOTE we use the `readonly` and `?` (partial) status of these field definitions
// to describe the same attributes of the fields
export type StrictStructuredTypeDefFields = {
  [Key: StructuredFieldKey]: AnyTypeDef,
}

// NOTE: we cannot collapse this type to
// `StructuredTypeDef = StructuredTypeDefFields`
// as we rely on the `fields` field being unique to discriminate between different
// TypeDefs
export type StrictStructuredTypeDef<
  Fields extends StrictStructuredTypeDefFields = StrictStructuredTypeDefFields,
> = {
  readonly type: TypeDefType.Structured,
  readonly fields: Fields,
}

export type StrictUnionTypeDef<
  D extends string | null = string | null,
  U extends Readonly<Record<UnionKey, AnyTypeDef>> = Readonly<Record<UnionKey, AnyTypeDef>>,
> = D extends null ? IsStrictUnion<U> extends true ? {
      readonly discriminator: null,
      readonly type: TypeDefType.Union,
      readonly unions: U,
    }
  : never
  // TODO enforce the unions are all structs
  : {
    readonly discriminator: D,
    readonly type: TypeDefType.Union,
    readonly unions: U,
  }

// tests whether the union is composed of one non-constant value (at ['0']) and the rest
// constants
export type IsStrictUnion<U extends Readonly<Record<UnionKey, AnyTypeDef>>> = IsEqual<
  U,
  Simplify<{
    readonly [K in keyof Omit<U, '0'> as U[K] extends StrictLiteralTypeDef ? K : never]: U[K]
  } & (U extends { readonly ['0']: AnyTypeDef } ? {
      readonly ['0']: U['0'],
    }
    : {})>
>

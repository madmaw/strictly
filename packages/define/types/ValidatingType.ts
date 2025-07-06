import { type FunctionalValidator } from 'validation/validator'
import {
  type ObjectFieldKey,
  type RecordKeyType,
  type TypeDefType,
  type UnionKey,
} from './Type'

// type defs with error types, lets us attach validation to types

export type ValidatingType<T extends ValidatingTypeDef = ValidatingTypeDef> = {
  readonly definition: T,
}

export type ErrorOfValidatingTypeDef<T extends ValidatingTypeDef> = T extends ValidatingTypeDef<infer E> ? E : never

export type ContextOfValidatingTypeDef<T extends ValidatingTypeDef> = T extends ValidatingTypeDef<infer _E, infer C> ? C
  : never

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Rule<E, C, V = any> = FunctionalValidator<V, E, string, C>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ValidatingTypeDef<E = any, C = any> =
  | ValidatingLiteralTypeDef<E, C>
  | ValidatingListTypeDef<E, C>
  | ValidatingRecordTypeDef<E, C>
  | ValidatingObjectTypeDef<E, C>
  | ValidatingUnionTypeDef<E, C>

// used to avoid TS complaining about circular references
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyTypeDef = any

// literal
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ValidatingLiteralTypeDef<E = any, C = any, V = any> = {
  readonly type: TypeDefType.Literal,
  readonly valuePrototype: [V],
  readonly rule: Rule<E, C>,
  readonly required: boolean,
  readonly readonly: boolean,
}

// list
export type ValidatingListTypeDef<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  E = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  C = any,
  Ele extends ValidatingTypeDef = AnyTypeDef,
> = {
  readonly type: TypeDefType.List,
  // readonly is inherited by the output
  readonly elements: Ele,
  readonly rule: Rule<E, C>,
  readonly required: boolean,
  readonly readonly: boolean,
}

// map
export type ValidatingRecordTypeDef<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  E = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  C = any,
  K extends RecordKeyType = RecordKeyType,
  // if `V` includes `undefined` the map is partial
  V extends ValidatingTypeDef | undefined = AnyTypeDef,
> = {
  readonly type: TypeDefType.Record,
  // never actually populate
  readonly keyPrototype: K,
  // readonly is inherited by the output
  readonly valueTypeDef: V,
  readonly rule: Rule<E, C>,
  readonly required: boolean,
  readonly readonly: boolean,
}

// structured type

// NOTE we use the `readonly` and `?` (partial) status of these field definitions
// to describe the same attributes of the fields
export type ValidatingObjectTypeDefFields = {
  [Key: ObjectFieldKey]: AnyTypeDef,
}

// NOTE: we cannot collapse this type to
// `StructuredTypeDef = StructuredTypeDefFields`
// as we rely on the `fields` field being unique to discriminate between different
// TypeDefs
export type ValidatingObjectTypeDef<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  E = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  C = any,
  Fields extends ValidatingObjectTypeDefFields = ValidatingObjectTypeDefFields,
> = {
  readonly type: TypeDefType.Object,
  readonly fields: Fields,
  readonly rule: Rule<E, C>,
  readonly required: boolean,
  readonly readonly: boolean,
}

export type ValidatingUnionTypeDef<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  E = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  C = any,
  D extends string | null = string | null,
  U extends Readonly<Record<UnionKey, AnyTypeDef>> = Readonly<Record<UnionKey, AnyTypeDef>>,
> = {
  readonly discriminator: D,
  readonly type: TypeDefType.Union,
  readonly unions: U,
  readonly rule: Rule<E, C>,
  readonly required: boolean,
  readonly readonly: boolean,
}

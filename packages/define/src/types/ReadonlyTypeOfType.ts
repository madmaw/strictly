import { type Type } from './Type'

declare const readonlyBrand: unique symbol

export type ReadonlyBrand = {
  readonly [readonlyBrand]: true
}

/**
 * A type whose values are readonly all the way down. The brand exists only at the type level, at
 * runtime a readonly type is the same schema
 */
export type ReadonlyTypeOfType<T extends Type> = T & ReadonlyBrand

export type IsReadonlyType<T> = T extends ReadonlyBrand ? true : false

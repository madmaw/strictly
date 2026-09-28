import { type LiteralTypeDef } from './Type'

/**
 * the type of `valuePrototype` says it is always present, however literals that are built without a prototype
 * have an `undefined` prototype at runtime, so read it through here when the value may be missing
 */
export function valuePrototypeOf<V>({ valuePrototype }: LiteralTypeDef<V>): readonly V[] | undefined {
  return valuePrototype
}

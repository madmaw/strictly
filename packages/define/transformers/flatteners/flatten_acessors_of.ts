import { type TypeDefHolder } from 'types/definitions'
import { type ValueTypeOf } from 'types/value_type_of'

export function flattenAccessorsOf<T extends TypeDefHolder>(
  _typeDef: T,
  _value: ValueTypeOf<T>,
) {
}

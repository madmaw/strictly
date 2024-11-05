import { type TypeDefHolder } from 'types/definitions'
import { type FlattenedValueTypesOf } from 'types/flattened_value_types_of'
import { type ReadonlyTypeDefOf } from 'types/readonly_type_def_of'
import { type ValueTypeOf } from 'types/value_type_of'
import {
  type AnyValueType,
  flattenValue,
} from './flatten_value'

function mapper(v: AnyValueType) {
  return v
}

export function flattenValueOf<T extends TypeDefHolder>(
  typeDef: TypeDefHolder,
  value: ValueTypeOf<T>,
): FlattenedValueTypesOf<T> {
  return flattenValue(typeDef, value, mapper)
}

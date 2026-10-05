import { nodeOf, optionOf } from 'define/types/node'
import { type ReadonlyTypeOfType } from 'define/types/ReadonlyTypeOfType'
import { type Type } from 'define/types/Type'
import { type ValueOfType } from 'define/types/ValueOfType'
import { UnreachableError } from 'errors/Unreachable'
import { map, reduce } from 'util/record'

// oxlint-disable-next-line typescript/no-explicit-any
export type AnyValueType = any

export type Copier<R> = (v: AnyValueType, t: Type) => R

export function copyTo<
  T extends Type,
  R extends ValueOfType<ReadonlyTypeOfType<T>>,
>(t: T, value: ValueOfType<ReadonlyTypeOfType<T>>, copier: Copier<R>): R {
  return internalCopyTo(t, value, copier)
}

/**
 * Creates a copy of the supplied value
 * @param t description of the object to create
 * @param value the value to populate the object from
 * @returns a copy of the supplied value
 */
function internalCopyTo<R>(t: Type, value: AnyValueType, copier: Copier<R>): R {
  if (typeof value === 'undefined') {
    // don't copy things that don't exist
    // oxlint-disable-next-line no-undefined, typescript/no-non-null-assertion -- propagate the missing value
    return undefined!
  }
  const node = nodeOf(t)
  switch (node.kind) {
    case 'literal':
      return copier(value, t)
    case 'wrapper':
      return value == null
        ? copier(value, t)
        : internalCopyTo(node.inner, value, copier)
    case 'list': {
      const { element } = node
      const list = (value as AnyValueType[]).map((e) =>
        internalCopyTo(element, e, copier),
      )
      return copier(list, t)
    }
    case 'record': {
      const { value: valueType } = node
      const record = map(value, (_key, v) =>
        internalCopyTo(valueType, v, copier),
      )
      return copier(record, t)
    }
    case 'object': {
      const record = reduce(
        node.fields,
        (acc, key, field) => {
          const fieldValue = value[key]
          acc[key] =
            fieldValue == null
              ? fieldValue
              : internalCopyTo(field, fieldValue, copier)
          return acc
        },
        {} as Record<string, AnyValueType>,
      )
      return copier(record, t)
    }
    case 'union':
      return internalCopyTo(optionOf(node, value), value, copier)
    default:
      throw new UnreachableError(node)
  }
}

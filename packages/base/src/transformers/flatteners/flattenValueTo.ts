import { UnreachableError } from 'errors/Unreachable'
import { nodeOf, optionOf, type SchemaNode } from 'types/node'
import { type ReadonlyTypeOfType } from 'types/ReadonlyTypeOfType'
import { type Type } from 'types/Type'
import { type ValueOfType } from 'types/ValueOfType'
import { lookup } from 'util/record'
import { jsonPath } from './jsonPath'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyValueType = any
export type Setter<V> = (v: V) => void

export type Mapper<R> = (
  t: Type,
  v: AnyValueType,
  setter: Setter<AnyValueType>,
  typePath: string,
  valuePath: string,
) => R

type FlattenContext<M> = {
  readonly mapper: Mapper<M>
  readonly r: Record<string, M>
  readonly listIndicesToKeys: Record<string, number[]>
}

export function flattenValueTo<
  T extends Type,
  M,
  R extends Readonly<Record<string, M>>,
>(
  t: T,
  v: ValueOfType<ReadonlyTypeOfType<T>>,
  setter: Setter<ValueOfType<T>>,
  mapper: Mapper<M>,
  // used to maintain keys when changing lists, note that the format for a list of three elements is
  // [key1, key2, key3, nextKey]
  // the final value always contains the next key
  listIndicesToKeys: Record<string, number[]> = {},
): R {
  const r: Record<string, AnyValueType> = {}
  internalFlattenValue('$', '$', t, v, setter, {
    mapper,
    r,
    listIndicesToKeys,
  })
  return r as R
}

function internalFlattenValue<M>(
  valuePath: string,
  typePath: string,
  t: Type,
  v: AnyValueType,
  setter: Setter<AnyValueType>,
  context: FlattenContext<M>,
) {
  context.r[valuePath] = context.mapper(t, v, setter, typePath, valuePath)
  // a missing value has no children
  if (v != null) {
    internalFlattenValueChildren(valuePath, typePath, nodeOf(t), v, context)
  }
}

function internalFlattenValueChildren<M>(
  valuePath: string,
  typePath: string,
  node: SchemaNode,
  v: AnyValueType,
  context: FlattenContext<M>,
) {
  switch (node.kind) {
    case 'literal':
      // no children
      break
    case 'wrapper':
      internalFlattenValueChildren(
        valuePath,
        typePath,
        nodeOf(node.inner),
        v,
        context,
      )
      break
    case 'list':
      internalFlattenListChildren(valuePath, typePath, node.element, v, context)
      break
    case 'record':
      internalFlattenRecordChildren(valuePath, typePath, node.value, v, context)
      break
    case 'object':
      internalFlattenObjectChildren(
        valuePath,
        typePath,
        node.fields,
        v,
        context,
      )
      break
    case 'union': {
      const option = optionOf(node, v)
      const qualifier =
        node.discriminator == null ? '' : `:${v[node.discriminator]}`
      internalFlattenValueChildren(
        `${valuePath}${qualifier}`,
        `${typePath}${qualifier}`,
        nodeOf(option),
        v,
        context,
      )
      break
    }
    default:
      throw new UnreachableError(node)
  }
}

function internalFlattenListChildren<M>(
  valuePath: string,
  typePath: string,
  element: Type,
  v: AnyValueType[],
  context: FlattenContext<M>,
) {
  const { listIndicesToKeys } = context
  let indicesToKeys = lookup(listIndicesToKeys, valuePath)
  if (indicesToKeys == null) {
    indicesToKeys = [0]
    listIndicesToKeys[valuePath] = indicesToKeys
  }
  const keys = indicesToKeys

  const newTypePath = jsonPath(typePath, '*')
  v.forEach((e, index) => {
    const key = keys[index]
    // we have consumed the next id passively
    if (index === keys.length - 1) {
      // we have consumed the next key, so we need to add a new one
      keys.push(key + 1)
    }
    internalFlattenValue(
      jsonPath(valuePath, key),
      newTypePath,
      element,
      e,
      (e: AnyValueType) => {
        v[index] = e
      },
      context,
    )
  })
}

function internalFlattenRecordChildren<M>(
  valuePath: string,
  typePath: string,
  value: Type,
  v: Record<string, AnyValueType>,
  context: FlattenContext<M>,
) {
  const newTypePath = jsonPath(typePath, '*')
  Object.keys(v).forEach((k) => {
    internalFlattenValue(
      jsonPath(valuePath, k),
      newTypePath,
      value,
      v[k],
      (value: AnyValueType) => {
        v[k] = value
      },
      context,
    )
  })
}

function internalFlattenObjectChildren<M>(
  valuePath: string,
  typePath: string,
  fields: Readonly<Record<string, Type>>,
  v: Record<string, AnyValueType>,
  context: FlattenContext<M>,
) {
  Object.keys(fields).forEach((k) => {
    internalFlattenValue(
      jsonPath(valuePath, k),
      jsonPath(typePath, k),
      fields[k],
      v[k],
      (value: AnyValueType) => {
        v[k] = value
      },
      context,
    )
  })
}

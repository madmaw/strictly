import { reduce, UnreachableError } from '@strictly/base'
import { nodeOf, optionsByDiscriminatorOf, type SchemaNode } from 'types/node'
import { type Type } from 'types/Type'
import { jsonPath } from './jsonPath'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyValueType = any

export type Mapper<R> = (t: Type, key: string) => R

export function flattenTypeTo<M, R extends Readonly<Record<string, M>>>(
  t: Type,
  mapper: Mapper<M>,
): R {
  const types = internalFlattenType('$', t, {})
  return reduce<string, Type, Record<string, M>>(
    types,
    (acc, key, type) => {
      acc[key] = mapper(type, key)
      return acc
    },
    {},
  ) as R
}

function internalFlattenType(
  path: string,
  t: Type,
  r: Record<string, Type>,
): Record<string, Type> {
  r[path] = t
  return internalFlattenTypeChildren(path, nodeOf(t), r)
}

function internalFlattenTypeChildren(
  path: string,
  node: SchemaNode,
  r: Record<string, Type>,
): Record<string, Type> {
  switch (node.kind) {
    case 'literal':
      return r
    case 'wrapper':
      return internalFlattenTypeChildren(path, nodeOf(node.inner), r)
    case 'list':
      return internalFlattenType(jsonPath(path, '*'), node.element, r)
    case 'record':
      return internalFlattenType(jsonPath(path, '*'), node.value, r)
    case 'object':
      return reduce(
        node.fields,
        (acc, fieldName, field) =>
          internalFlattenType(jsonPath(path, fieldName), field, acc),
        r,
      )
    case 'union':
      if (node.discriminator == null) {
        return node.options.reduce(
          (acc, option) =>
            internalFlattenTypeChildren(path, nodeOf(option), acc),
          r,
        )
      }
      return reduce(
        optionsByDiscriminatorOf(node),
        (acc, key, option) =>
          internalFlattenTypeChildren(`${path}:${key}`, nodeOf(option), acc),
        r,
      )
    default:
      throw new UnreachableError(node)
  }
}

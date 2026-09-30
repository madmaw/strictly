import { UnreachableError } from 'errors/Unreachable'
import {
  nodeOf,
  optionsByDiscriminatorOf,
  type SchemaNode,
  variableOptionOf,
} from 'types/node'
import { type Type } from 'types/Type'
import { type ValueOfType } from 'types/ValueOfType'

export function equals<T extends Type>(
  t: T,
  o1: ValueOfType<T>,
  o2: ValueOfType<T>,
): boolean {
  return internalEquals(t, o1, o2)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function internalEquals(t: Type, o1: any, o2: any): boolean {
  // get rid of optional values
  if (o1 === o2) {
    return true
  }
  if ((o1 == null && o2 != null) || (o1 != null && o2 == null)) {
    return false
  }
  const node = nodeOf(t)
  switch (node.kind) {
    case 'literal':
      return o1 === o2
    case 'wrapper':
      return internalEquals(node.inner, o1, o2)
    case 'list':
      return internalListEquals(node.element, o1, o2)
    case 'record':
      return internalRecordEquals(node.value, o1, o2)
    case 'object':
      return internalObjectEquals(node.fields, o1, o2)
    case 'union':
      return internalUnionEquals(node, o1, o2)
    default:
      throw new UnreachableError(node)
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function internalListEquals(element: Type, o1: any[], o2: any[]) {
  return (
    o1.length === o2.length &&
    o1.every((v, i) => internalEquals(element, v, o2[i]))
  )
}

function internalRecordEquals(
  value: Type,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  o1: Record<string, any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  o2: Record<string, any>,
) {
  const k1s = Object.keys(o1).sort()
  const k2s = Object.keys(o2).sort()
  return (
    k1s.length === k2s.length &&
    k1s.every((k1, i) => {
      const k2 = k2s[i]
      return k1 === k2 && internalEquals(value, o1[k1], o2[k2])
    })
  )
}

function internalObjectEquals(
  fields: Readonly<Record<string, Type>>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  o1: Record<string, any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  o2: Record<string, any>,
) {
  return Object.entries(fields).every(([key, field]) =>
    internalEquals(field, o1[key], o2[key]),
  )
}

function internalUnionEquals(
  node: SchemaNode & { readonly kind: 'union' },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  o1: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  o2: any,
) {
  const { discriminator } = node
  if (discriminator != null) {
    return (
      o1[discriminator] === o2[discriminator] &&
      internalEquals(optionsByDiscriminatorOf(node)[o1[discriminator]], o1, o2)
    )
  }
  const option = variableOptionOf(node)
  return option != null && internalEquals(option, o1, o2)
}

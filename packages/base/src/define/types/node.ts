import { UnexpectedImplementationError } from 'errors/UnexpectedImplementation'
import { lookup } from 'util/record'
import { type z } from 'zod'
import { type Type } from './Type'

export type LiteralNode = {
  readonly kind: 'literal'
  // the values the literal accepts, or null when the schema accepts a range of values
  readonly values: readonly unknown[] | null
}

export type WrapperNode = {
  readonly kind: 'wrapper'
  readonly inner: Type
}

export type ListNode = {
  readonly kind: 'list'
  readonly element: Type
}

export type RecordNode = {
  readonly kind: 'record'
  readonly value: Type
}

export type ObjectNode = {
  readonly kind: 'object'
  readonly fields: Readonly<Record<string, Type>>
}

export type UnionNode = {
  readonly kind: 'union'
  readonly discriminator: string | null
  readonly options: readonly Type[]
}

/**
 * A structural view of a Zod schema, reduced to the cases the transformers care about
 */
export type SchemaNode =
  | LiteralNode
  | WrapperNode
  | ListNode
  | RecordNode
  | ObjectNode
  | UnionNode

type Def = z.core.$ZodTypes['_zod']['def']

function defOf(t: Type): Def {
  return t._zod.def as Def
}

// schemas that accept exactly one value, which behave like literals
const singletonValues: Partial<Record<Def['type'], readonly unknown[]>> = {
  null: [null],
  // oxlint-disable-next-line no-undefined -- the literal accepts exactly undefined
  undefined: [undefined],
}

export function nodeOf(t: Type): SchemaNode {
  const def = defOf(t)
  if (
    def.type === 'optional' ||
    def.type === 'nullable' ||
    def.type === 'readonly' ||
    def.type === 'default' ||
    def.type === 'prefault' ||
    def.type === 'nonoptional' ||
    def.type === 'catch'
  ) {
    return {
      kind: 'wrapper',
      inner: def.innerType,
    }
  }
  if (def.type === 'array') {
    return {
      kind: 'list',
      element: def.element,
    }
  }
  if (def.type === 'record') {
    return {
      kind: 'record',
      value: def.valueType,
    }
  }
  if (def.type === 'object') {
    return {
      kind: 'object',
      fields: def.shape,
    }
  }
  if (def.type === 'union') {
    return {
      kind: 'union',
      discriminator:
        'discriminator' in def && typeof def.discriminator === 'string'
          ? def.discriminator
          : null,
      options: def.options,
    }
  }
  if (def.type === 'literal') {
    return {
      kind: 'literal',
      values: def.values,
    }
  }
  const singleton = lookup(singletonValues, def.type)
  if (singleton != null) {
    return {
      kind: 'literal',
      values: singleton,
    }
  }
  if (def.type === 'enum') {
    return {
      kind: 'literal',
      values: Object.values(def.entries),
    }
  }
  // every other schema is a value without structure
  return {
    kind: 'literal',
    values: null,
  }
}

/**
 * Removes the wrappers that do not change the structure of the value
 */
export function unwrap(t: Type): Type {
  const node = nodeOf(t)
  return node.kind === 'wrapper' ? unwrap(node.inner) : t
}

function literalValuesOf(t: Type): readonly unknown[] | null {
  const node = nodeOf(unwrap(t))
  return node.kind === 'literal' ? node.values : null
}

/**
 * The value of the discriminator field of an option of a discriminated union
 */
export function discriminatorValueOf(
  option: Type,
  discriminator: string,
): string {
  const node = nodeOf(unwrap(option))
  if (node.kind === 'union' && node.discriminator != null) {
    // every option of a nested discriminated union carries the same value
    return discriminatorValueOf(node.options[0], discriminator)
  }
  if (node.kind !== 'object') {
    throw new UnexpectedImplementationError(
      'options of discriminated unions must be objects or discriminated unions',
    )
  }
  const values = literalValuesOf(node.fields[discriminator])
  if (values?.length !== 1) {
    throw new UnexpectedImplementationError(
      'discriminators must be single valued literals',
    )
  }
  return String(values[0])
}

export function optionsByDiscriminatorOf({
  discriminator,
  options,
}: UnionNode): Readonly<Record<string, Type>> {
  if (discriminator == null) {
    throw new UnexpectedImplementationError('union has no discriminator')
  }
  return Object.fromEntries(
    options.map((option) => [
      discriminatorValueOf(option, discriminator),
      option,
    ]),
  )
}

/**
 * Finds the option of a union that describes the value. Unions without a discriminator must be
 * composed of literals and at most one other option, the way a nullable type is
 */
// oxlint-disable-next-line typescript/no-explicit-any
export function optionOf(union: UnionNode, value: any): Type {
  const { discriminator, options } = union
  if (discriminator != null) {
    const option = lookup(optionsByDiscriminatorOf(union), value[discriminator])
    if (option == null) {
      throw new UnexpectedImplementationError(
        'no option for discriminator value {}',
        value[discriminator],
      )
    }
    return option
  }
  let fallback: Type | null = null
  for (const option of options) {
    const values = literalValuesOf(option)
    if (values == null) {
      if (fallback != null) {
        throw new UnexpectedImplementationError(
          'unions without a discriminator can have at most one option that is not a literal',
        )
      }
      fallback = option
    } else if (values.includes(value)) {
      return option
    }
  }
  if (fallback == null) {
    throw new UnexpectedImplementationError('no option for value {}', value)
  }
  return fallback
}

/**
 * The option of a union without a discriminator that is not a literal, if any
 */
export function variableOptionOf({ options }: UnionNode): Type | null {
  return options.find((option) => literalValuesOf(option) == null) ?? null
}

import { type Type, type Unwrap } from 'types/Type'
import { z } from 'zod'
import { type Annotations, validate, type Validator } from './validator'

declare const rulesBrand: unique symbol

/**
 * Carries the error and context types of the rules attached to a schema. Zod ignores it
 */
export type Rules<E, C> = {
  readonly [rulesBrand]: {
    readonly errors: E
    readonly context: C
  }
}

export type ErrorsOfType<T> =
  Unwrap<T> extends Rules<infer E, unknown> ? E : never

export type ContextOfType<T> =
  Unwrap<T> extends Rules<unknown, infer C> ? C : {}

export type Meta = Annotations & {
  readonly rules: readonly Validator[]
}

export const emptyMeta: Meta = {
  rules: [],
  required: false,
  readonly: false,
}

const registry = z.registry<Meta>()

function registrable(t: Type): z.core.$ZodType {
  return t as unknown as z.core.$ZodType
}

export function metaOf(t: Type): Meta {
  return registry.get(registrable(t)) ?? emptyMeta
}

/**
 * Attaches the rules and annotations to a copy of the schema, so shared schema instances are never
 * mutated
 */
export function withMeta<T extends Type>(t: T, meta: Meta): T {
  const copy = z.core.clone(registrable(t)) as unknown as T
  registry.add(registrable(copy), meta)
  return copy
}

export function annotationsOf(t: Type): Annotations {
  const { required, readonly } = metaOf(t)
  return {
    required,
    readonly,
  }
}

/**
 * Runs the rules attached to the schema in order and returns the first error
 */
export function validateRulesOf<V, C>(
  t: Type,
  v: V,
  valuePath: string,
  context: C,
): unknown {
  for (const rule of metaOf(t).rules) {
    const error = validate(rule, v, valuePath, context)
    if (error != null) {
      return error
    }
  }
  return null
}

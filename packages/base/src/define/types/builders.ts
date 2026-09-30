import {
  type ContextOfType,
  emptyMeta,
  type ErrorsOfType,
  type Meta,
  metaOf,
  type Rules,
  withMeta,
} from 'define/validation/rules'
import {
  isAnnotatedValidator,
  mergeAnnotations,
  type Validator,
} from 'define/validation/validator'
import { UnreachableError } from 'errors/Unreachable'
import { z } from 'zod'
import { nodeOf } from './node'
import { type ReadonlyField, type Type } from './Type'
import { type ValueOfType } from './ValueOfType'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyBuilder = TypeBuilder<any, any, any> | UnionBuilder<any, any, any, any>

export type Buildable = Type | AnyBuilder

/**
 * The schema a builder produces, or the schema itself when given a schema
 */
export type SchemaOf<B extends Buildable> =
  B extends TypeBuilder<infer S, infer E, infer C>
    ? S & Rules<E, C>
    : B extends UnionBuilder<infer D, infer Options, infer E, infer C>
      ? UnionSchema<D, Options> & Rules<E, C>
      : B

function schemaOf<B extends Buildable>(b: B): SchemaOf<B> {
  return (
    b instanceof TypeBuilder || b instanceof UnionBuilder ? b.narrow : b
  ) as SchemaOf<B>
}

// the annotations of a validator do not depend on the value
const noValuePath = null as unknown as string
const noContext = null as unknown as never

export class TypeBuilder<S extends Type, E = never, C = {}> {
  constructor(
    readonly schema: S,
    protected readonly meta: Meta = emptyMeta,
  ) {}

  /**
   * Attaches a rule, or, when no rule is supplied, only the error type so errors of that type can be
   * reported against the value by other means
   */
  enforce<E2, C2 = {}>(
    rule?: Validator<ValueOfType<S>, E2, string, C2>,
  ): TypeBuilder<S, E | E2, C & C2> {
    if (rule == null) {
      return new TypeBuilder(this.schema, this.meta)
    }
    const annotations = isAnnotatedValidator(rule)
      ? mergeAnnotations(rule.annotations(noValuePath, noContext), this.meta)
      : this.meta
    return new TypeBuilder(this.schema, {
      ...annotations,
      rules: [...this.meta.rules, rule],
    })
  }

  required(): TypeBuilder<S, E, C> {
    return new TypeBuilder(this.schema, {
      ...this.meta,
      required: true,
    })
  }

  readonly(): TypeBuilder<S, E, C> {
    return new TypeBuilder(this.schema, {
      ...this.meta,
      readonly: true,
    })
  }

  get narrow(): S & Rules<E, C> {
    return withMeta(this.schema, this.meta) as S & Rules<E, C>
  }
}

class ListBuilder<Element extends Type, E = never, C = {}> extends TypeBuilder<
  z.ZodArray<Element>,
  E,
  C
> {
  readonlyElements(): TypeBuilder<z.ZodReadonly<z.ZodArray<Element>>, E, C> {
    const { element } = this.schema.def
    return new TypeBuilder(
      z.readonly(
        z.array(
          withMeta(element, {
            ...metaOf(element),
            readonly: true,
          }),
        ),
      ),
      this.meta,
    )
  }
}

type RecordKey<K extends string | number> = z.core.$ZodType<K, K>

class RecordBuilder<
  Key extends z.core.$ZodRecordKey,
  Value extends Type,
  E = never,
  C = {},
> extends TypeBuilder<z.ZodRecord<Key, Value>, E, C> {
  partialKeys(): RecordBuilder<Key & z.core.$partial, Value, E, C> {
    const { keyType, valueType } = this.schema.def
    return new RecordBuilder(z.partialRecord(keyType, valueType), this.meta)
  }

  readonlyKeys(): TypeBuilder<z.ZodReadonly<z.ZodRecord<Key, Value>>, E, C> {
    const { keyType, valueType } = this.schema.def
    return new TypeBuilder(
      z.readonly(
        z.record(
          keyType,
          withMeta(valueType, {
            ...metaOf(valueType),
            readonly: true,
          }),
        ),
      ),
      this.meta,
    )
  }
}

class ObjectBuilder<
  Shape extends z.core.$ZodShape,
  E = never,
  C = {},
> extends TypeBuilder<z.ZodObject<Shape>, E, C> {
  field<Name extends string, B extends Buildable>(
    name: Name,
    b: B,
  ): ObjectBuilder<Shape & Record<Name, SchemaOf<B>>, E, C> {
    return this.withField(name, schemaOf(b))
  }

  readonlyField<Name extends string, B extends Buildable>(
    name: Name,
    b: B,
  ): ObjectBuilder<Shape & Record<Name, ReadonlyField<SchemaOf<B>>>, E, C> {
    return this.withField(name, readonlyField(schemaOf(b)))
  }

  optionalField<Name extends string, B extends Buildable>(
    name: Name,
    b: B,
  ): ObjectBuilder<Shape & Record<Name, z.ZodOptional<SchemaOf<B>>>, E, C> {
    return this.withField(name, z.optional(schemaOf(b)))
  }

  readonlyOptionalField<Name extends string, B extends Buildable>(
    name: Name,
    b: B,
  ): ObjectBuilder<
    Shape & Record<Name, ReadonlyField<z.ZodOptional<SchemaOf<B>>>>,
    E,
    C
  > {
    return this.withField(name, readonlyField(z.optional(schemaOf(b))))
  }

  private withField<Name extends string, T extends Type>(
    name: Name,
    t: T,
  ): ObjectBuilder<Shape & Record<Name, T>, E, C> {
    const shape = Object.assign({}, this.schema.def.shape, {
      [name]: t,
    }) as Shape & Record<Name, T>
    return new ObjectBuilder(z.object(shape), this.meta)
  }
}

type UnionSchema<
  D extends string | null,
  Options extends readonly Type[],
> = D extends string ? z.ZodDiscriminatedUnion<Options, D> : z.ZodUnion<Options>

// options of a discriminated union gain the discriminator as a field, nested discriminated unions
// gain it on each of their options
type OptionOf<D extends string | null, K extends string, S> = D extends string
  ? S extends z.ZodObject<infer Shape>
    ? z.ZodObject<Shape & Record<D, z.ZodLiteral<K>>> &
        Rules<ErrorsOfType<S>, ContextOfType<S>>
    : S extends z.ZodDiscriminatedUnion<infer Options, infer D2>
      ? z.ZodDiscriminatedUnion<
          { [I in keyof Options]: OptionOf<D, K, Options[I]> },
          D2
        > &
          Rules<ErrorsOfType<S>, ContextOfType<S>>
      : never
  : S

class UnionBuilder<
  D extends string | null,
  Options extends readonly Type[],
  E = never,
  C = {},
> {
  constructor(
    private readonly discriminator: D,
    private readonly options: Options,
    private readonly meta: Meta = emptyMeta,
  ) {}

  or<K extends string, B extends Buildable>(
    k: K,
    b: B,
  ): UnionBuilder<D, [...Options, OptionOf<D, K, SchemaOf<B>>], E, C> {
    const option = schemaOf(b)
    return new UnionBuilder(
      this.discriminator,
      [...this.options, this.withDiscriminator(k, option)],
      this.meta,
    )
  }

  private withDiscriminator<K extends string, S extends Type>(
    k: K,
    option: S,
  ): OptionOf<D, K, S> {
    const { discriminator } = this
    if (discriminator == null) {
      return option as OptionOf<D, K, S>
    }
    return withDiscriminatorField(option, discriminator, k) as OptionOf<D, K, S>
  }

  private get typeBuilder(): TypeBuilder<UnionSchema<D, Options>, E, C> {
    const { discriminator, options } = this
    const schema = (discriminator == null
      ? z.union(options as unknown as readonly z.core.$ZodType[])
      : z.discriminatedUnion(
          discriminator,
          options as unknown as [z.ZodObject, ...z.ZodObject[]],
        )) as unknown as UnionSchema<D, Options>
    return new TypeBuilder(schema, this.meta)
  }

  enforce<E2, C2 = {}>(
    rule?: Validator<ValueOfType<UnionSchema<D, Options>>, E2, string, C2>,
  ): TypeBuilder<UnionSchema<D, Options>, E | E2, C & C2> {
    return this.typeBuilder.enforce(rule)
  }

  required(): TypeBuilder<UnionSchema<D, Options>, E, C> {
    return this.typeBuilder.required()
  }

  readonly(): TypeBuilder<UnionSchema<D, Options>, E, C> {
    return this.typeBuilder.readonly()
  }

  get narrow(): UnionSchema<D, Options> & Rules<E, C> {
    return this.typeBuilder.narrow
  }
}

function withDiscriminatorField(
  option: Type,
  discriminator: string,
  k: string,
): Type {
  const node = nodeOf(option)
  switch (node.kind) {
    case 'object':
      return withMeta(
        z.object({
          ...node.fields,
          [discriminator]: literal([k]).readonly().required().narrow,
        }),
        metaOf(option),
      )
    case 'union':
      if (node.discriminator != null) {
        return withMeta(
          z.discriminatedUnion(
            node.discriminator,
            node.options.map((nested) =>
              withDiscriminatorField(nested, discriminator, k),
            ) as unknown as [z.ZodObject, ...z.ZodObject[]],
          ),
          metaOf(option),
        )
      }
      throw new Error(
        'options of discriminated unions must be objects or discriminated unions',
      )
    case 'literal':
    case 'wrapper':
    case 'list':
    case 'record':
      throw new Error(
        'options of discriminated unions must be objects or discriminated unions',
      )
    default:
      throw new UnreachableError(node)
  }
}

/**
 * Marks a field of an object as not reassignable. Usable directly in `z.object` shapes
 */
export function readonlyField<T extends Type>(t: T): ReadonlyField<T> {
  return withMeta(t, {
    ...metaOf(t),
    readonly: true,
  }) as ReadonlyField<T>
}

/**
 * Wraps any Zod schema in a builder
 */
export function define<S extends Type>(schema: S): TypeBuilder<S> {
  return new TypeBuilder(schema)
}

/**
 * A literal that is described by its type alone, or one that accepts only the supplied values
 */
export function literal<T>(): TypeBuilder<z.ZodCustom<T, T>>
export function literal<const T extends z.core.util.Literal>(
  values: readonly T[],
): TypeBuilder<z.ZodLiteral<T>>
export function literal<T extends z.core.util.Literal>(values?: readonly T[]) {
  return values == null
    ? new TypeBuilder(z.custom<T>())
    : new TypeBuilder(z.literal(values))
}

export const stringType = define(z.string())
export const numberType = define(z.number())
export const booleanType = define(z.boolean())
export const nullType = define(z.null())

export function nullable<B extends Buildable>(
  b: B,
): TypeBuilder<z.ZodNullable<SchemaOf<B>>> {
  return new TypeBuilder(z.nullable(schemaOf(b)))
}

export function list<B extends Buildable>(b: B): ListBuilder<SchemaOf<B>> {
  return new ListBuilder(z.array(schemaOf(b)))
}

export function record<B extends Buildable, K extends string | number = string>(
  b: B,
): RecordBuilder<RecordKey<K>, SchemaOf<B>> {
  // the key is only ever described by its type
  const key = z.union([z.string(), z.number()]) as unknown as RecordKey<K>
  return new RecordBuilder(z.record(key, schemaOf(b)))
}

export function object(): ObjectBuilder<{}> {
  return new ObjectBuilder(z.object({}))
}

export function union(): UnionBuilder<null, []>
export function union<D extends string>(discriminator: D): UnionBuilder<D, []>
export function union<D extends string | null>(
  discriminator?: D,
): UnionBuilder<D, []> {
  return new UnionBuilder((discriminator ?? null) as D, [])
}

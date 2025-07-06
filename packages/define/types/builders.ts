import {
  type IsFieldReadonly,
} from '@strictly/base'
import {
  isAnnotatedValidator,
  mergeAnnotations,
  validate,
  type Validator,
} from 'validation/validator'
import {
  type ObjectFieldKey,
  type RecordKeyType,
  type Type,
  type TypeDef,
  TypeDefType,
  type UnionKey,
} from './Type'
import {
  type TypeOfType,
  typeOfType,
} from './typeOfType'
import {
  type Rule,
  type ValidatingListTypeDef,
  type ValidatingLiteralTypeDef,
  type ValidatingObjectTypeDef,
  type ValidatingRecordTypeDef,
  type ValidatingType,
  type ValidatingTypeDef,
  type ValidatingUnionTypeDef,
} from './ValidatingType'
import { type ValidatingTypeDefWithError } from './ValidatingTypeDefWithError'
import {
  type ValueOfType,
  type ValueOfTypeDef,
} from './ValueOfType'

function emptyRule() {
  return null
}

class TypeDefBuilder<T extends ValidatingTypeDef> implements ValidatingType<T> {
  constructor(readonly definition: T) {
  }

  enforce<E2, C2 = unknown>(): TypeDefBuilder<ValidatingTypeDefWithError<T, E2, C2>>
  enforce<E2,
    C2 = unknown>(rule: Validator<ValueOfType<Type<T>>, E2, string, C2>
  ): TypeDefBuilder<ValidatingTypeDefWithError<T, E2, C2>>
  enforce<E2, C2 = unknown>(rule?: Validator<ValueOfType<Type<T>>, E2, string, C2>) {
    return new TypeDefBuilder<ValidatingTypeDefWithError<T, E2, C2>>(
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      {
        ...this.definition,
        ...(rule != null && isAnnotatedValidator(rule)
          ? mergeAnnotations(rule.annotations(null!, null!), this.definition)
          : {}),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rule: (value: any, valuePath: string, context: any) => {
          return this.definition.rule(value, valuePath, context) ?? (rule && validate(rule, value, valuePath, context))
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    )
  }

  required(): TypeDefBuilder<T> {
    return new TypeDefBuilder<T>(
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      {
        ...this.definition,
        required: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    )
  }

  readonly(): TypeDefBuilder<T> {
    return new TypeDefBuilder<T>(
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      {
        ...this.definition,
        readonly: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    )
  }

  // should only be used in tests requiring Types, client code should be happy with validating types
  // eslint-disable-next-line @typescript-eslint/naming-convention
  get _type(): TypeOfType<Type<T>> {
    return typeOfType<Type<T>>(this)
  }

  get narrow(): ValidatingType<T> {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return {
      definition: this.definition,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any
  }
}

class ListTypeDefBuilder<
  T extends ValidatingListTypeDef,
> extends TypeDefBuilder<T> {
  readonlyElements(): ListTypeDefBuilder<{
    readonly type: TypeDefType.List,
    readonly elements: T['elements'],
    readonly rule: T['rule'],
    readonly required: boolean,
    readonly readonly: boolean,
  }> {
    return new ListTypeDefBuilder({
      ...this.definition,
      elements: {
        ...this.definition.elements,
        readonly: true,
      },
    })
  }
}

class RecordTypeDefBuilder<T extends ValidatingRecordTypeDef> extends TypeDefBuilder<T> {
  partialKeys(): IsFieldReadonly<T, 'valueTypeDef'> extends true ? RecordTypeDefBuilder<{
      readonly type: TypeDefType.Record,
      readonly keyPrototype: T['keyPrototype'],
      readonly valueTypeDef: T['valueTypeDef'] | undefined,
      readonly rule: T['rule'],
      readonly required: boolean,
      readonly readonly: boolean,
    }>
    : RecordTypeDefBuilder<{
      readonly type: TypeDefType.Record,
      readonly keyPrototype: T['keyPrototype'],
      valueTypeDef: T['valueTypeDef'] | undefined,
      readonly rule: T['rule'],
      readonly required: boolean,
      readonly readonly: boolean,
    }>
  {
    return this
  }

  readonlyKeys(): RecordTypeDefBuilder<{
    readonly type: TypeDefType.Record,
    readonly keyPrototype: T['keyPrototype'],
    readonly valueTypeDef: T['valueTypeDef'],
    readonly rule: T['rule'],
    readonly required: boolean,
    readonly readonly: boolean,
  }> {
    return new RecordTypeDefBuilder({
      ...this.definition,
      valueTypeDef: {
        ...this.definition.valueTypeDef,
        readonly: true,
      },
    })
  }
}
class ObjectTypeDefBuilder<
  E,
  C,
  Fields extends Readonly<Record<ObjectFieldKey, ValidatingTypeDef>> = {},
> extends TypeDefBuilder<
  ValidatingObjectTypeDef<E, C, Fields>
> {
  field<
    Name extends string,
    T extends ValidatingTypeDef,
  >(
    name: Name,
    { definition }: Type<T>,
  ): ObjectTypeDefBuilder<
    E,
    C,
    Fields & Record<Name, T>
  >
  field<
    Name extends string,
    T extends ValidatingTypeDef,
    RequiredError,
    C2,
  >(
    name: Name,
    { definition }: Type<T>,
    rule: Rule<RequiredError, ValueOfTypeDef<T>>,
  ): ObjectTypeDefBuilder<
    E,
    C & C2,
    Fields & Record<Name, ValidatingTypeDefWithError<T, RequiredError, C & C2>>
  >
  field<
    Name extends string,
    T extends ValidatingTypeDef,
    RequiredError = never,
    C2 = {},
  >(
    name: Name,
    { definition }: Type<T>,
    rule?: Rule<RequiredError, C2, ValueOfTypeDef<T>>,
  ): ObjectTypeDefBuilder<
    E,
    C & C2,
    Fields & Record<Name, ValidatingTypeDefWithError<T, RequiredError, C2>>
  > {
    // have to explicitly supply types as TS will infinitely recurse trying to infer them!
    return new ObjectTypeDefBuilder<
      E,
      C & C2,
      Fields & Record<Name, ValidatingTypeDefWithError<T, RequiredError, C2>>
    >({
      ...this.definition,
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      fields: {
        ...this.definition.fields,
        [name]: {
          ...definition,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          rule: function (v: any, valuePath: string, context: C2) {
            return definition.rule(v, valuePath, context) ?? (rule && validate(rule, v, valuePath, context))
          },
        },
      } as Fields & Record<Name, ValidatingTypeDefWithError<T, RequiredError, C2>>,
    })
  }

  readonlyField<
    Name extends string,
    T extends ValidatingTypeDef,
  >(
    name: Name,
    { definition }: Type<T>,
  ): ObjectTypeDefBuilder<
    E,
    C,
    Fields & Readonly<Record<Name, T>>
  > {
    const newFields = {
      [name]: {
        ...definition,
        readonly: true,
      },
    }
    // have to explicitly supply types as TS will infinitely recurse trying to infer them!
    return new ObjectTypeDefBuilder<
      E,
      C,
      Fields & Readonly<Record<Name, T>>
    >({
      ...this.definition,
      fields: {
        ...this.definition.fields,
        ...newFields,
      },
    })
  }

  optionalField<
    Name extends string,
    T extends ValidatingTypeDef,
  >(
    name: Name,
    { definition }: Type<T>,
  ): ObjectTypeDefBuilder<
    E,
    C,
    Fields & Partial<Record<Name, T>>
  > {
    const newFields = {
      [name]: {
        ...definition,
      },
    }
    // have to explicitly supply types as TS will infinitely recurse trying to infer them!
    return new ObjectTypeDefBuilder<
      E,
      C,
      Fields & Partial<Record<Name, T>>
    >({
      ...this.definition,
      fields: {
        ...this.definition.fields,
        ...newFields,
      },
    })
  }

  readonlyOptionalField<
    Name extends string,
    T extends TypeDef,
  >(
    name: Name,
    { definition }: Type<T>,
  ): ObjectTypeDefBuilder<
    E,
    C,
    Fields & Partial<Readonly<Record<Name, T>>>
  > {
    const newFields = {
      [name]: {
        ...definition,
        readonly: true,
      },
    }
    // have to explicitly supply types as TS will infinitely recurse trying to infer them!
    return new ObjectTypeDefBuilder<
      E,
      C,
      Fields & Partial<Readonly<Record<Name, T>>>
    >({
      ...this.definition,
      fields: {
        ...this.definition.fields,
        ...newFields,
      },
    })
  }
}

class UnionTypeDefBuilder<
  E,
  C,
  D extends string | null,
  U extends Record<UnionKey, TypeDef>,
> extends TypeDefBuilder<
  ValidatingUnionTypeDef<
    E,
    C,
    D,
    U
  >
> {
  or<
    K extends Exclude<UnionKey, keyof U>,
    T extends TypeDef,
  >(
    k: K,
    {
      definition: typeDef,
    }: Type<T>,
  ): UnionTypeDefBuilder<E, C, D, Readonly<Record<K, T>> & U> {
    const {
      unions,
    } = this.definition
    return new UnionTypeDefBuilder<E, C, D, Readonly<Record<K, T>> & U>(
      {
        ...this.definition,
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        unions: {
          ...unions,
          [k]: typeDef,
        } as Readonly<Record<K, T>> & U,
      },
    )
  }
}

export function literal<T>(value?: [T]): TypeDefBuilder<ValidatingLiteralTypeDef<never, {}, T>> {
  return new TypeDefBuilder({
    type: TypeDefType.Literal,
    valuePrototype: value!,
    rule: emptyRule,
    readonly: false,
    required: false,
  })
}

export const stringType = literal<string>()
export const numberType = literal<number>()
export const booleanType = literal<boolean>()
export const nullType = literal([null])

export function nullable<
  T extends ValidatingTypeDef,
>(nonNullable: ValidatingType<T>): UnionTypeDefBuilder<
  never,
  {},
  null,
  {
    readonly ['0']: T,
    readonly ['1']: ValidatingLiteralTypeDef<never, {}, null>,
  }
> {
  return new UnionTypeDefBuilder(
    {
      type: TypeDefType.Union,
      discriminator: null,
      unions: {
        ['0']: nonNullable.definition,
        ['1']: nullType.definition,
      },
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      rule: emptyRule as Rule<never, {}>,
      readonly: false,
      required: false,
    },
  )
}

export function list<T extends ValidatingTypeDef>(elements: ValidatingType<T>): ListTypeDefBuilder<{
  readonly type: TypeDefType.List,
  elements: T,
  readonly rule: Rule<never, {}>,
  readonly readonly: boolean,
  readonly required: boolean,
}> {
  // have to explicitly supply types as TS will infinitely recurse trying to infer them!
  return new ListTypeDefBuilder<ValidatingListTypeDef<never, {}, T>>({
    type: TypeDefType.List,
    elements: elements.definition,
    rule: emptyRule,
    readonly: false,
    required: false,
  })
}

export function record<
  V extends ValidatingType,
  // NOTE if we swap these generics and the caller forgets to supply the second one (so the Type)
  // TSC will freeze
  K extends RecordKeyType,
>({ definition: valueTypeDef }: V) {
  return new RecordTypeDefBuilder<{
    readonly type: TypeDefType.Record,
    readonly keyPrototype: K,
    valueTypeDef: V['definition'],
    readonly rule: Rule<never, {}>,
    readonly readonly: boolean,
    readonly required: boolean,
  }>({
    type: TypeDefType.Record,
    keyPrototype: undefined!,
    valueTypeDef,
    rule: emptyRule,
    readonly: false,
    required: false,
  })
}

export function object(): ObjectTypeDefBuilder<never, {}> {
  // have to explicitly supply types as TS will infinitely recurse trying to infer them!
  return new ObjectTypeDefBuilder<never, {}>({
    type: TypeDefType.Object,
    fields: {},
    rule: emptyRule,
    readonly: false,
    required: false,
  })
}

export function union<D extends null>(): UnionTypeDefBuilder<never, {}, D, {}>
export function union<D extends string>(discriminator: D): UnionTypeDefBuilder<never, {}, D, {}>
export function union<D extends string | null>(discriminator?: D): UnionTypeDefBuilder<never, {}, D, {}> {
  // have to explicitly supply types as TS will infinitely recurse trying to infer them!
  return new UnionTypeDefBuilder<never, {}, D, {}>(
    {
      type: TypeDefType.Union,
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      discriminator: (discriminator ?? null) as D,
      unions: {},
      rule: emptyRule,
      readonly: false,
      required: false,
    },
  )
}

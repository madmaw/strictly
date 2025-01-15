import {
  type IsFieldReadonly,
} from '@strictly/base'
import {
  type ObjectFieldKey,
  type RecordKeyType,
  type Type,
  type TypeDef,
  TypeDefType,
  type UnionKey,
} from './definitions'
import { type TypeOfType } from './type_of_type'
import {
  type Rule,
  type ValidatingListTypeDef,
  type ValidatingLiteralTypeDef,
  type ValidatingObjectTypeDef,
  type ValidatingRecordTypeDef,
  type ValidatingType,
  type ValidatingTypeDef,
  type ValidatingUnionTypeDef,
} from './validating_definitions'
import { type ValidatingTypeDefWithError } from './validating_type_def_with_error'
import { type ValueOfType } from './value_of_type'

function emptyRule() {
  return null
}

class TypeDefBuilder<T extends ValidatingTypeDef> implements ValidatingType<T> {
  constructor(readonly definition: T) {
  }

  addRule<E2>(rule: Rule<E2, ValueOfType<Type<T>>>) {
    return new TypeDefBuilder<ValidatingTypeDefWithError<T, E2>>(
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      {
        ...this.definition,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rule: (value: any) => {
          return this.definition.rule(value) || rule(value)
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    )
  }

  // can we remove this and remove non-validating definitions entirely
  // eslint-disable-next-line @typescript-eslint/naming-convention
  get _type(): TypeOfType<Type<T>> {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return {
      definition: this.definition,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any
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
  readonly(): ListTypeDefBuilder<{
    readonly type: TypeDefType.List,
    readonly elements: T['elements'],
    readonly rule: T['rule'],
  }> {
    return this
  }
}

class RecordTypeDefBuilder<T extends ValidatingRecordTypeDef> extends TypeDefBuilder<T> {
  partial(): IsFieldReadonly<T, 'valueTypeDef'> extends true ? RecordTypeDefBuilder<{
      readonly type: TypeDefType.Record,
      readonly keyPrototype: T['keyPrototype'],
      readonly valueTypeDef: T['valueTypeDef'] | undefined,
      readonly rule: T['rule'],
    }>
    : RecordTypeDefBuilder<{
      readonly type: TypeDefType.Record,
      readonly keyPrototype: T['keyPrototype'],
      valueTypeDef: T['valueTypeDef'] | undefined,
      readonly rule: T['rule'],
    }>
  {
    return this
  }

  readonly(): RecordTypeDefBuilder<{
    readonly type: TypeDefType.Record,
    readonly keyPrototype: T['keyPrototype'],
    readonly valueTypeDef: T['valueTypeDef'],
    readonly rule: T['rule'],
  }> {
    return this
  }
}

class ObjectTypeDefBuilder<
  E,
  Fields extends Readonly<Record<ObjectFieldKey, ValidatingTypeDef>> = {},
> extends TypeDefBuilder<
  ValidatingObjectTypeDef<E, Fields>
> {
  field<
    Name extends string,
    T extends ValidatingTypeDef,
  >(
    name: Name,
    { definition: typeDef }: Type<T>,
  ): ObjectTypeDefBuilder<
    E,
    Fields & Record<Name, T>
  > {
    const newFields = {
      [name]: typeDef,
    }
    // have to explicitly supply types as TS will infinitely recurse trying to infer them!
    return new ObjectTypeDefBuilder<
      E,
      Fields & Record<Name, T>
    >({
      type: TypeDefType.Object,
      fields: {
        ...this.definition.fields,
        ...newFields,
      },
      rule: this.definition.rule,
    })
  }

  readonlyField<
    Name extends string,
    T extends ValidatingTypeDef,
  >(
    name: Name,
    { definition: typeDef }: Type<T>,
  ): ObjectTypeDefBuilder<
    E,
    Fields & Readonly<Record<Name, T>>
  > {
    const newFields = {
      [name]: typeDef,
    }
    // have to explicitly supply types as TS will infinitely recurse trying to infer them!
    return new ObjectTypeDefBuilder<
      E,
      Fields & Readonly<Record<Name, T>>
    >({
      type: TypeDefType.Object,
      fields: {
        ...this.definition.fields,
        ...newFields,
      },
      rule: this.definition.rule,
    })
  }

  optionalField<
    Name extends string,
    T extends ValidatingTypeDef,
  >(
    name: Name,
    { definition: typeDef }: Type<T>,
  ): ObjectTypeDefBuilder<
    E,
    Fields & Partial<Record<Name, T>>
  > {
    const newFields = {
      [name]: typeDef,
    }
    // have to explicitly supply types as TS will infinitely recurse trying to infer them!
    return new ObjectTypeDefBuilder<
      E,
      Fields & Partial<Record<Name, T>>
    >({
      type: TypeDefType.Object,
      fields: {
        ...this.definition.fields,
        ...newFields,
      },
      rule: emptyRule,
    })
  }

  readonlyOptionalField<
    Name extends string,
    T extends TypeDef,
  >(
    name: Name,
    { definition: typeDef }: Type<T>,
  ): ObjectTypeDefBuilder<
    E,
    Fields & Partial<Readonly<Record<Name, T>>>
  > {
    const newFields = {
      [name]: typeDef,
    }
    // have to explicitly supply types as TS will infinitely recurse trying to infer them!
    return new ObjectTypeDefBuilder<
      E,
      Fields & Partial<Readonly<Record<Name, T>>>
    >({
      type: TypeDefType.Object,
      fields: {
        ...this.definition.fields,
        ...newFields,
      },
      rule: this.definition.rule,
    })
  }
}

class UnionTypeDefBuilder<
  E,
  D extends string | null,
  U extends Record<UnionKey, TypeDef>,
> extends TypeDefBuilder<
  ValidatingUnionTypeDef<
    E,
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
  ): UnionTypeDefBuilder<E, D, Readonly<Record<K, T>> & U> {
    const {
      discriminator,
      unions,
    } = this.definition
    return new UnionTypeDefBuilder<E, D, Readonly<Record<K, T>> & U>(
      {
        type: TypeDefType.Union,
        discriminator: discriminator,
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        unions: {
          ...unions,
          [k]: typeDef,
        } as Readonly<Record<K, T>> & U,
        rule: this.definition.rule,
      },
    )
  }
}

export function literal<T>(value?: [T]): TypeDefBuilder<ValidatingLiteralTypeDef<never, T>> {
  return new TypeDefBuilder({
    type: TypeDefType.Literal,
    valuePrototype: value!,
    rule: emptyRule,
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
  null,
  {
    readonly ['0']: T,
    readonly ['1']: ValidatingLiteralTypeDef<never, null>,
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
      rule: emptyRule as Rule<never>,
    },
  )
}

export function list<T extends ValidatingTypeDef>(elements: ValidatingType<T>): ListTypeDefBuilder<{
  readonly type: TypeDefType.List,
  elements: T,
  readonly rule: Rule<never>,
}> {
  // have to explicitly supply types as TS will infinitely recurse trying to infer them!
  return new ListTypeDefBuilder<ValidatingListTypeDef<never, T>>({
    type: TypeDefType.List,
    elements: elements.definition,
    rule: emptyRule,
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
    readonly rule: Rule<never>,
  }>({
    type: TypeDefType.Record,
    keyPrototype: undefined!,
    valueTypeDef,
    rule: emptyRule,
  })
}

export function object(): ObjectTypeDefBuilder<never, {}> {
  // have to explicitly supply types as TS will infinitely recurse trying to infer them!
  return new ObjectTypeDefBuilder<never, {}>({
    type: TypeDefType.Object,
    fields: {},
    rule: emptyRule,
  })
}

export function union<D extends null>(): UnionTypeDefBuilder<never, D, {}>
export function union<D extends string>(discriminator: D): UnionTypeDefBuilder<never, D, {}>
export function union<D extends string | null>(discriminator?: D): UnionTypeDefBuilder<never, D, {}> {
  // have to explicitly supply types as TS will infinitely recurse trying to infer them!
  return new UnionTypeDefBuilder<never, D, {}>(
    {
      type: TypeDefType.Union,
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      discriminator: (discriminator ?? null) as D,
      unions: {},
      rule: emptyRule,
    },
  )
}

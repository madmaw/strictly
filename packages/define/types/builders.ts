import {
  type IsFieldReadonly,
} from '@de/base'
import {
  type ListTypeDef,
  type LiteralTypeDef,
  type MapKeyType,
  type MapTypeDef,
  type StructuredFieldKey,
  type StructuredTypeDef,
  type TypeDef,
  type TypeDefHolder,
  TypeDefType,
  type UnionKey,
  type UnionTypeDef,
} from './definitions'

class TypeDefBuilder<T extends TypeDef> implements TypeDefHolder<T> {
  constructor(readonly typeDef: T) {
  }

  // returns just the relevant types, which can help typescript
  // from complaining about infinitely deep data structures
  get narrow(): TypeDefHolder<T> {
    return {
      typeDef: this.typeDef,
    }
  }
}

class LiteralTypeDefBuilder<T> extends TypeDefBuilder<LiteralTypeDef<T>> {
}

class ListTypeDefBuilder<
  T extends ListTypeDef,
> extends TypeDefBuilder<T> {
  readonly(): ListTypeDefBuilder<{
    readonly type: TypeDefType.List,
    readonly elements: T['elements'],
  }> {
    return this
  }
}

class MapTypeDefBuilder<T extends MapTypeDef> extends TypeDefBuilder<T> {
  partial(): IsFieldReadonly<T, 'valueTypeDef'> extends true ? MapTypeDefBuilder<{
      readonly type: TypeDefType.Map,
      readonly keyPrototype: T['keyPrototype'],
      readonly valueTypeDef: T['valueTypeDef'] | undefined,
    }>
    : MapTypeDefBuilder<{
      readonly type: TypeDefType.Map,
      readonly keyPrototype: T['keyPrototype'],
      valueTypeDef: T['valueTypeDef'] | undefined,
    }>
  {
    return this
  }

  readonly(): MapTypeDefBuilder<{
    readonly type: TypeDefType.Map,
    readonly keyPrototype: T['keyPrototype'],
    readonly valueTypeDef: T['valueTypeDef'],
  }> {
    return this
  }
}

class StructuredTypeDefBuilder<
  Fields extends Readonly<Record<StructuredFieldKey, TypeDef>> = {},
> extends TypeDefBuilder<
  StructuredTypeDef<Fields>
> {
  set<
    Name extends string,
    T extends TypeDef,
  >(
    name: Name,
    { typeDef }: TypeDefHolder<T>,
  ): StructuredTypeDefBuilder<
    Fields & Record<Name, T>
  > {
    const newFields = {
      [name]: typeDef,
    }
    // have to explicitly supply types as TS will infinitely recurse trying to infer them!
    return new StructuredTypeDefBuilder<
      Fields & Record<Name, T>
    >({
      type: TypeDefType.Structured,
      fields: {
        ...this.typeDef.fields,
        ...newFields,
      },
    })
  }

  setReadonly<
    Name extends string,
    T extends TypeDef,
  >(
    name: Name,
    { typeDef }: TypeDefHolder<T>,
  ): StructuredTypeDefBuilder<
    Fields & Readonly<Record<Name, T>>
  > {
    const newFields = {
      [name]: typeDef,
    }
    // have to explicitly supply types as TS will infinitely recurse trying to infer them!
    return new StructuredTypeDefBuilder<
      Fields & Readonly<Record<Name, T>>
    >({
      type: TypeDefType.Structured,
      fields: {
        ...this.typeDef.fields,
        ...newFields,
      },
    })
  }

  setOptional<
    Name extends string,
    T extends TypeDef,
  >(
    name: Name,
    { typeDef }: TypeDefHolder<T>,
  ): StructuredTypeDefBuilder<
    Fields & Partial<Record<Name, T>>
  > {
    const newFields = {
      [name]: typeDef,
    }
    // have to explicitly supply types as TS will infinitely recurse trying to infer them!
    return new StructuredTypeDefBuilder<
      Fields & Partial<Record<Name, T>>
    >({
      type: TypeDefType.Structured,
      fields: {
        ...this.typeDef.fields,
        ...newFields,
      },
    })
  }

  setReadonlyOptional<
    Name extends string,
    T extends TypeDef,
  >(
    name: Name,
    { typeDef }: TypeDefHolder<T>,
  ): StructuredTypeDefBuilder<
    Fields & Partial<Readonly<Record<Name, T>>>
  > {
    const newFields = {
      [name]: typeDef,
    }
    // have to explicitly supply types as TS will infinitely recurse trying to infer them!
    return new StructuredTypeDefBuilder<
      Fields & Partial<Readonly<Record<Name, T>>>
    >({
      type: TypeDefType.Structured,
      fields: {
        ...this.typeDef.fields,
        ...newFields,
      },
    })
  }
}

class UnionTypeDefBuilder<
  D extends string | null,
  U extends Record<UnionKey, TypeDef>,
> extends TypeDefBuilder<
  UnionTypeDef<
    D,
    U
  >
> {
  add<
    K extends Exclude<UnionKey, keyof U>,
    T extends TypeDef,
  >(
    k: K,
    {
      typeDef,
    }: TypeDefHolder<T>,
  ): UnionTypeDefBuilder<D, Readonly<Record<K, T>> & U> {
    const {
      discriminator,
      unions,
    } = this.typeDef
    return new UnionTypeDefBuilder<D, Readonly<Record<K, T>> & U>(
      {
        type: TypeDefType.Union,
        discriminator: discriminator,
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        unions: {
          ...unions,
          [k]: typeDef,
        } as Readonly<Record<K, T>> & U,
      },
    )
  }
}

export function literal<T>(value?: [T]): LiteralTypeDefBuilder<T> {
  return new LiteralTypeDefBuilder({
    type: TypeDefType.Literal,
    valuePrototype: value!,
  })
}

export const string = literal<string>()
export const number = literal<number>()
export const boolean = literal<boolean>()
export const nullTypeDefHolder = literal([null])

export function nullable<T extends TypeDef>(nonNullable: TypeDefHolder<T>): UnionTypeDefBuilder<null, {
  readonly ['0']: T,
  readonly ['1']: LiteralTypeDef<null>,
}> {
  return new UnionTypeDefBuilder(
    {
      type: TypeDefType.Union,
      discriminator: null,
      unions: {
        ['0']: nonNullable.typeDef,
        ['1']: nullTypeDefHolder.typeDef,
      },
    },
  )
}

export function list<T extends TypeDef>(elements: TypeDefHolder<T>): ListTypeDefBuilder<{
  readonly type: TypeDefType.List,
  elements: T,
}> {
  // have to explicitly supply types as TS will infinitely recurse trying to infer them!
  return new ListTypeDefBuilder<ListTypeDef<T>>({
    type: TypeDefType.List,
    elements: elements.typeDef,
  })
}

export function map<
  V extends TypeDefHolder,
  // NOTE if we swap these generics and the caller forgets to supply the second one (so the TypeDefHolder)
  // TSC will freeze
  K extends MapKeyType,
>({ typeDef }: V) {
  return new MapTypeDefBuilder<{
    readonly type: TypeDefType.Map,
    readonly keyPrototype: K,
    valueTypeDef: V['typeDef'],
  }>({
    type: TypeDefType.Map,
    // eslint-disable-next-line no-undefined
    keyPrototype: undefined!,
    valueTypeDef: typeDef,
  })
}

export function struct(): StructuredTypeDefBuilder<{}> {
  // have to explicitly supply types as TS will infinitely recurse trying to infer them!
  return new StructuredTypeDefBuilder<{}>({
    type: TypeDefType.Structured,
    fields: {},
  })
}

export function union<D extends null>(): UnionTypeDefBuilder<D, {}>
export function union<D extends string>(discriminator: D): UnionTypeDefBuilder<D, {}>
export function union<D extends string | null>(discriminator?: D): UnionTypeDefBuilder<D, {}> {
  // have to explicitly supply types as TS will infinitely recurse trying to infer them!
  return new UnionTypeDefBuilder<D, {}>(
    {
      type: TypeDefType.Union,
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      discriminator: (discriminator ?? null) as D,
      unions: {},
    },
  )
}

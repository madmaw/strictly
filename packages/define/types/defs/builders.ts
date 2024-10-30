import {
  type PartialReadonlyRecord,
  type PartialRecord,
  type ReadonlyRecord,
} from 'util/record'
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
} from './index'

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
  T extends TypeDef,
  Readonly extends boolean,
> extends TypeDefBuilder<ListTypeDef<T, Readonly>> {
  readonly() {
    return new ListTypeDefBuilder<T, true>({
      ...this.typeDef,
      readonly: true,
    })
  }
}

class MapTypeDefBuilder<T extends MapTypeDef> extends TypeDefBuilder<T> {
  partial() {
    return new MapTypeDefBuilder<
      MapTypeDef<
        T['keyPrototype'],
        T['valueTypeDef'] | undefined
      >
    >(this.typeDef)
  }

  readonly() {
    return new MapTypeDefBuilder<
      MapTypeDef<
        T['keyPrototype'],
        T['valueTypeDef'],
        true
      >
    >({
      ...this.typeDef,
      readonly: true,
    })
  }
}

class StructuredTypeDefBuilder<
  Fields extends ReadonlyRecord<StructuredFieldKey, TypeDef> = {},
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
    Fields & ReadonlyRecord<Name, T>
  > {
    const newFields = {
      [name]: typeDef,
    }
    // have to explicitly supply types as TS will infinitely recurse trying to infer them!
    return new StructuredTypeDefBuilder<
      Fields & ReadonlyRecord<Name, T>
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
    Fields & PartialRecord<Name, T>
  > {
    const newFields = {
      [name]: typeDef,
    }
    // have to explicitly supply types as TS will infinitely recurse trying to infer them!
    return new StructuredTypeDefBuilder<
      Fields & PartialRecord<Name, T>
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
    Fields & PartialReadonlyRecord<Name, T>
  > {
    const newFields = {
      [name]: typeDef,
    }
    // have to explicitly supply types as TS will infinitely recurse trying to infer them!
    return new StructuredTypeDefBuilder<
      Fields & PartialReadonlyRecord<Name, T>
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
  U extends Record<string | number, TypeDef>,
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
  ): UnionTypeDefBuilder<D, ReadonlyRecord<K, T> & U> {
    const {
      discriminator,
      unions,
    } = this.typeDef
    return new UnionTypeDefBuilder<D, ReadonlyRecord<K, T> & U>(
      {
        type: TypeDefType.Union,
        discriminator: discriminator,
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        unions: {
          ...unions,
          [k]: typeDef,
        } as ReadonlyRecord<K, T> & U,
      },
    )
  }
}

export function literal<T>(): LiteralTypeDefBuilder<T> {
  return new LiteralTypeDefBuilder({
    type: TypeDefType.Literal,
    // eslint-disable-next-line no-undefined
    valuePrototype: undefined!,
  })
}

export const string = literal<string>()
export const number = literal<number>()
export const boolean = literal<boolean>()
export const nullTypeDefHolder = literal<null>()

export function nullable<T extends TypeDef>(nonNullable: TypeDefHolder<T>): UnionTypeDefBuilder<null, {
  readonly [0]: LiteralTypeDef<null>,
  readonly [1]: T,
}> {
  return new UnionTypeDefBuilder(
    {
      discriminator: null,
      type: TypeDefType.Union,
      unions: {
        [0]: nullTypeDefHolder.typeDef,
        [1]: nonNullable.typeDef,
      },
    },
  )
}

export function list<T extends TypeDef>(elements: TypeDefHolder<T>): ListTypeDefBuilder<T, false> {
  // have to explicitly supply types as TS will infinitely recurse trying to infer them!
  return new ListTypeDefBuilder<T, false>({
    type: TypeDefType.List,
    elements: elements.typeDef,
    readonly: false,
  })
}

export function map<K extends MapKeyType, V extends TypeDefHolder>({ typeDef }: V) {
  return new MapTypeDefBuilder<MapTypeDef<K, V['typeDef'], false>>({
    type: TypeDefType.Map,
    // eslint-disable-next-line no-undefined
    keyPrototype: undefined!,
    valueTypeDef: typeDef,
    readonly: false,
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
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      discriminator: (discriminator ?? null) as D,
      type: TypeDefType.Union,
      unions: {},
    },
  )
}

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
  type NullableTypeDef,
  type ReadonlyTypeDef,
  type StructuredFieldKey,
  type StructuredTypeDef,
  type TypeDef,
  type TypeDefHolder,
  TypeDefType,
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

class NullableTypeDefBuilder<T extends TypeDef> extends TypeDefBuilder<NullableTypeDef<T>> {
}

class ListTypeDefBuilder<
  T extends TypeDef,
> extends TypeDefBuilder<ListTypeDef<T>> {
}

class MapTypeDefBuilder<
  K extends MapKeyType,
  V extends TypeDef,
  Partial extends boolean,
> extends TypeDefBuilder<MapTypeDef<K, V, Partial>> {
  partial() {
    return new MapTypeDefBuilder<K, V, true>({
      ...this.typeDef,
      partial: true,
    })
  }
}

class ReadonlyTypeDefBuilder<
  T extends ListTypeDef | MapTypeDef,
> extends TypeDefBuilder<ReadonlyTypeDef<T>> {
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
  U extends Record<string | number, TypeDef>,
> extends TypeDefBuilder<
  UnionTypeDef<
    U
  >
> {
  add<
    K extends Exclude<string | number, keyof U>,
    T extends TypeDef,
  >(
    k: K,
    {
      typeDef,
    }: TypeDefHolder<T>,
  ): UnionTypeDefBuilder<ReadonlyRecord<K, T> & U> {
    return new UnionTypeDefBuilder<ReadonlyRecord<K, T> & U>(
      {
        type: TypeDefType.Union,
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        unions: {
          ...this.typeDef.unions,
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

export function nullable<T extends TypeDef>(nonNullable: TypeDefHolder<T>): NullableTypeDefBuilder<T> {
  // have to explicitly supply types as TS will infinitely recurse trying to infer them!
  return new NullableTypeDefBuilder<T>({
    type: TypeDefType.Nullable,
    toNullableTypeDef: nonNullable.typeDef,
  })
}

export function list<T extends TypeDef>(elements: TypeDefHolder<T>): ListTypeDefBuilder<T> {
  // have to explicitly supply types as TS will infinitely recurse trying to infer them!
  return new ListTypeDefBuilder<T>({
    type: TypeDefType.List,
    elements: elements.typeDef,
  })
}

export function map<K extends MapKeyType, V extends TypeDefHolder>({ typeDef }: V) {
  return new MapTypeDefBuilder<K, V['typeDef'], false>({
    type: TypeDefType.Map,
    // eslint-disable-next-line no-undefined
    keyPrototype: undefined!,
    valueTypeDef: typeDef,
    partial: false,
  })
}

export function readonly<T extends MapTypeDef | ListTypeDef>({ typeDef }: TypeDefHolder<T>) {
  return new ReadonlyTypeDefBuilder<T>({
    type: TypeDefType.Readonly,
    toReadonlyTypeDef: typeDef,
  })
}

export function struct(): StructuredTypeDefBuilder<{}> {
  // have to explicitly supply types as TS will infinitely recurse trying to infer them!
  return new StructuredTypeDefBuilder<{}>({
    type: TypeDefType.Structured,
    fields: {},
  })
}

export function union(): UnionTypeDefBuilder<{}> {
  // have to explicitly supply types as TS will infinitely recurse trying to infer them!
  return new UnionTypeDefBuilder<{}>(
    {
      type: TypeDefType.Union,
      unions: {},
    },
  )
}

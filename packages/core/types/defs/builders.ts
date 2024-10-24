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
  type PartialTypeDef,
  type ReadonlyTypeDef,
  type StructuredFieldKey,
  type StructuredTypeDef,
  type TypeDef,
  type UnionTypeDef,
} from '.'
import { type ValueTypeOf } from './value_type_of'

type TypeDefHolder<T extends TypeDef> = {
  readonly typeDef: T,
}

class TypeDefBuilder<T extends TypeDef> implements TypeDefHolder<T> {
  /**
   * Instance of the type of the built typedef. This value is never populated
   * and should only be used as `typeof x.aInstance`
   */
  readonly aValue!: ValueTypeOf<T>

  constructor(readonly typeDef: T) {
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
> extends TypeDefBuilder<MapTypeDef<K, V>> {
}

class ReadonlyTypeDefBuilder<
  T extends ListTypeDef | MapTypeDef,
> extends TypeDefBuilder<ReadonlyTypeDef<T>> {
}

class PartialTypeDefBuilder<
  T extends MapTypeDef,
> extends TypeDefBuilder<PartialTypeDef<T>> {
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
    toNullableTypeDef: nonNullable.typeDef,
  })
}

export function list<T extends TypeDef>(elements: TypeDefHolder<T>): ListTypeDefBuilder<T> {
  // have to explicitly supply types as TS will infinitely recurse trying to infer them!
  return new ListTypeDefBuilder<T>({
    elements: elements.typeDef,
  })
}

export function map<K extends MapKeyType, V extends TypeDef>({ typeDef }: TypeDefHolder<V>) {
  return new MapTypeDefBuilder<K, V>({
    // eslint-disable-next-line no-undefined
    keyPrototype: undefined!,
    valueTypeDef: typeDef,
  })
}

export function readonly<T extends MapTypeDef | ListTypeDef>({ typeDef }: TypeDefHolder<T>) {
  return new ReadonlyTypeDefBuilder({
    toReadonlyTypeDef: typeDef,
  })
}

export function partial<T extends MapTypeDef>({ typeDef }: TypeDefHolder<T>) {
  return new PartialTypeDefBuilder({
    toPartialTypeDef: typeDef,
  })
}

export function struct() {
  // have to explicitly supply types as TS will infinitely recurse trying to infer them!
  return new StructuredTypeDefBuilder<{}>({
    fields: {},
  })
}

export function union(): UnionTypeDefBuilder<{}> {
  // have to explicitly supply types as TS will infinitely recurse trying to infer them!
  return new UnionTypeDefBuilder<{}>(
    {
      unions: {},
    },
  )
}

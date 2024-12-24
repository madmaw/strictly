import {
  reduce,
  UnreachableError,
} from '@de/base'
import {
  type IObservableFactory,
  makeObservable,
  observable,
} from 'mobx'
import { getUnionTypeDef } from 'transformers/flatteners/flatten_value_type_to'
import {
  type ObjectFieldKey,
  TypeDefType,
} from 'types/definitions'
import { type MobxValueTypeOf } from 'types/mobx_value_type_of'
import { type ReadonlyTypeDefOf } from 'types/readonly_type_def_of'
import {
  type StrictType,
  type StrictTypeDef,
} from 'types/strict_definitions'
import { type ValueTypeOf } from 'types/value_type_of'
import {
  type AnyValueType,
  copyTo,
} from './copy_to'

function observeValue(
  v: AnyValueType,
  def: StrictTypeDef,
): AnyValueType {
  if (v == null) {
    return v
  }
  switch (def.type) {
    case TypeDefType.Literal:
      return v
    case TypeDefType.List:
      // can't work out that an observable array is an array
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any
      return observable.array(v as any[], { deep: false }) as any
    case TypeDefType.Record:
      // observable observes all fields
      return observable(
        v,
        {},
        {
          deep: false,
        },
      )
    case TypeDefType.Object:
      // `makeObservable` only observes the specified props
      return makeObservable(
        v,
        reduce(
          def.fields,
          function (acc, k) {
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            acc[k as ObjectFieldKey] = observable
            return acc
          },
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          {} as Record<ObjectFieldKey, IObservableFactory>,
        ),
        {
          deep: false,
        },
      )
    case TypeDefType.Union:
      // delegate to the underlying value
      return observeValue(v, getUnionTypeDef(def, v))
    default:
      throw new UnreachableError(def)
  }
}

export function mobxCopy<T extends StrictType>(
  t: T,
  proto: ValueTypeOf<ReadonlyTypeDefOf<T>>,
): MobxValueTypeOf<T> {
  return copyTo(t, proto, observeValue)
}

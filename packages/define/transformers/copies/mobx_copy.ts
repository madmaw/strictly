import {
  reduce,
  UnreachableError,
} from '@de/base'
import {
  type IObservableFactory,
  makeObservable,
  observable,
} from 'mobx'
import {
  type StructuredFieldKey,
  TypeDefType,
} from 'types/definitions'
import { type MobxValueTypeOf } from 'types/mobx_value_type_of'
import { type ReadonlyTypeDefOf } from 'types/readonly_type_def_of'
import {
  type StrictTypeDef,
  type StrictTypeDefHolder,
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
    case TypeDefType.Map:
      // observable observes all fields
      return observable(
        v,
        {},
        {
          deep: false,
        },
      )
    case TypeDefType.Structured:
      // `makeObservable` only observes the specified props
      return makeObservable(
        v,
        reduce(
          def.fields,
          function (acc, k) {
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            acc[k as StructuredFieldKey] = observable
            return acc
          },
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          {} as Record<StructuredFieldKey, IObservableFactory>,
        ),
        {
          deep: false,
        },
      )
    case TypeDefType.Union:
      if (def.discriminator == null) {
        return observable(v)
      }
      // `makeObservable` only observes the specified props
      return makeObservable(
        v,
        reduce(
          def.unions[v[def.discriminator]],
          function (acc, k) {
            acc[k] = observable
            return acc
          },
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          {} as Record<string | number | symbol, IObservableFactory>,
        ),
        {
          deep: false,
        },
      )
    default:
      throw new UnreachableError(def)
  }
}

export function mobxCopy<T extends StrictTypeDefHolder>(
  t: T,
  proto: ValueTypeOf<ReadonlyTypeDefOf<T>>,
): MobxValueTypeOf<T> {
  return copyTo(t, proto, observeValue)
}

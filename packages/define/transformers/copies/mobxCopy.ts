import {
  reduce,
  UnreachableError,
} from '@strictly/base'
import {
  type IObservableFactory,
  makeObservable,
  observable,
} from 'mobx'
import { getUnionTypeDef } from 'transformers/flatteners/flattenValueTo'
import {
  type ObjectFieldKey,
  TypeDefType,
} from 'types/Definitions'
import { type MobxValueOfType } from 'types/MobxValueOfType'
import { type ReadonlyTypeOfType } from 'types/ReadonlyTypeOfType'
import {
  type StrictType,
  type StrictTypeDef,
} from 'types/StrictDefinitions'
import { type ValueOfType } from 'types/ValueOfType'
import {
  type AnyValueType,
  copyTo,
} from './copyTo'

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
  proto: ValueOfType<ReadonlyTypeOfType<T>>,
): MobxValueOfType<T> {
  return copyTo(t, proto, observeValue)
}

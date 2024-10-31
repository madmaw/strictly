import { UnreachableError } from 'errors/unreachable'
import {
  type IObservableFactory,
  makeObservable,
  observable,
} from 'mobx'
import {
  type StructuredFieldKey,
  type TypeDef,
  type TypeDefHolder,
  TypeDefType,
} from 'types/defs'
import { type MobxValueTypeOf } from 'types/defs/mobx_value_type_of'
import { type ReadonlyTypeDefOf } from 'types/defs/readonly_type_def_of'
import { type ValueTypeOf } from 'types/defs/value_type_of'
import { reduce } from 'util/record'
import {
  type AnyValueType,
  copy,
} from './copy'

function observeValue(
  v: AnyValueType,
  def: TypeDef,
): AnyValueType {
  if (v == null) {
    return v
  }
  switch (def.type) {
    case TypeDefType.Literal:
      return v
    case TypeDefType.List:
      if (!def.readonly) {
        // can't work out that an observable array is an array
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any
        return observable.array(v as any[], { deep: false }) as any
      } else {
        return v
      }
    case TypeDefType.Map:
      if (!def.readonly) {
        // make observable observes all fields
        return observable(
          v,
          {},
          {
            deep: false,
          },
        )
      } else {
        return v
      }
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

export function mobxCopy<T extends TypeDefHolder>(
  t: T,
  proto: ValueTypeOf<ReadonlyTypeDefOf<T>>,
): MobxValueTypeOf<T> {
  // TODO simplify types in a way where this doesn't happen
  // @ts-expect-error ignore the complaint about the infinitely deep type
  return copy(t, proto, observeValue)
}

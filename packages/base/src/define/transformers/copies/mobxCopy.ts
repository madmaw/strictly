import { type MobxValueOfType } from 'define/types/MobxValueOfType'
import { nodeOf, optionOf } from 'define/types/node'
import { type ReadonlyTypeOfType } from 'define/types/ReadonlyTypeOfType'
import { type Type } from 'define/types/Type'
import { type ValueOfType } from 'define/types/ValueOfType'
import { UnreachableError } from 'errors/Unreachable'
import { type IObservableFactory, observable } from 'mobx'
import { reduce } from 'util/record'
import { type AnyValueType, copyTo } from './copyTo'

function observeValue(v: AnyValueType, t: Type): AnyValueType {
  if (v == null) {
    return v
  }
  const node = nodeOf(t)
  switch (node.kind) {
    case 'literal':
      return v
    case 'wrapper':
      return observeValue(v, node.inner)
    case 'list':
      // can't work out that an observable array is an array
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return observable.array(v as any[], { deep: false }) as any
    case 'record':
      // observable observes all fields
      return observable(
        v,
        {},
        {
          deep: false,
        },
      )
    case 'object':
      // `makeObservable` only observes the specified props
      return observable(
        v,
        reduce(
          node.fields,
          (acc, k) => {
            acc[k] = observable
            return acc
          },
          {} as Record<string, IObservableFactory>,
        ),
        {
          deep: false,
        },
      )
    case 'union':
      // delegate to the underlying value
      return observeValue(v, optionOf(node, v))
    default:
      throw new UnreachableError(node)
  }
}

export function mobxCopy<T extends Type>(
  t: T,
  proto: ValueOfType<ReadonlyTypeOfType<T>>,
): MobxValueOfType<T> {
  return copyTo(t, proto, observeValue)
}

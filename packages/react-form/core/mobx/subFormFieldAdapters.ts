import { type StringConcatOf } from '@strictly/base'
import {
  type ContextOfFieldAdapter,
  type ErrorOfFieldAdapter,
  type FieldAdapter,
  type FromOfFieldAdapter,
  type ToOfFieldAdapter,
  type ValuePathOfFieldAdapter,
} from './FieldAdapter'

type SubFormFieldAdapter<F extends FieldAdapter, ValuePath extends string> = FieldAdapter<
  FromOfFieldAdapter<F>,
  ToOfFieldAdapter<F>,
  ErrorOfFieldAdapter<F>,
  ValuePathOfFieldAdapter<F> extends StringConcatOf<'$', infer ValuePathSuffix> ? `${ValuePath}${ValuePathSuffix}`
    // assume string (they don't care about the value path as a type) if there the path doesn't have a $ prefix
    : string,
  ContextOfFieldAdapter<F>
>

type SubFormFieldAdapters<
  SubAdapters extends Record<string, FieldAdapter>,
  TypePath extends string,
  ValuePath extends string,
> = {
  [
    K in keyof SubAdapters as K extends StringConcatOf<'$', infer TypePathSuffix> ? `${TypePath}${TypePathSuffix}`
      : never
  ]: SubFormFieldAdapter<
    SubAdapters[K],
    ValuePath
  >
}

export function subFormFieldAdapters<
  SubAdapters extends Record<string, FieldAdapter>,
  TypePath extends string,
  TypePathsToValuePaths extends Record<TypePath, string>,
>(
  subAdapters: SubAdapters,
  parentTypePath: TypePath,
): SubFormFieldAdapters<
  SubAdapters,
  TypePath,
  TypePathsToValuePaths[TypePath]
> {
  // assume the number of '.' in the type path will correspond to the number of '.' in the value path
  const dotCount = parentTypePath.split('.').length
  function getSubValuePath(valuePath: string) {
    const parentValuePath = valuePath.split('.').slice(0, dotCount).join('.')
    const subValuePath = valuePath.replace(parentValuePath, '$')
    return subValuePath
  }

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return Object.entries(subAdapters).reduce<Record<string, FieldAdapter>>((acc, [
    subTypePath,
    subAdapter,
  ]) => {
    const typePath = subTypePath.replace('$', parentTypePath)
    // adapt field adapter with new path and context
    const adaptedAdapter: FieldAdapter = {
      convert: (from, valuePath, context) => {
        return subAdapter.convert(from, getSubValuePath(valuePath), context)
      },
      create: (valuePath, context) => {
        return subAdapter.create(getSubValuePath(valuePath), context)
      },
      revert: subAdapter.revert && ((from, valuePath, context) => {
        return subAdapter.revert!(from, getSubValuePath(valuePath), context)
      }),
    }
    acc[typePath] = adaptedAdapter
    return acc
  }, {}) as SubFormFieldAdapters<
    SubAdapters,
    TypePath,
    TypePathsToValuePaths[TypePath]
  >
}

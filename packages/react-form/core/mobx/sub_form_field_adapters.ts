import { type StringConcatOf } from '@strictly/base'
import {
  flattenValuesOfType,
  type ReadonlyTypeOfType,
  type Type,
  type ValueOfType,
} from '@strictly/define'
import {
  type ErrorOfFieldAdapter,
  type FieldAdapter,
  type FromOfFieldAdapter,
  type ToOfFieldAdapter,
  type ValuePathOfFieldAdapter,
} from './field_adapter'

type SubFormFieldAdapter<F extends FieldAdapter, ValuePath extends string, Context> = FieldAdapter<
  FromOfFieldAdapter<F>,
  ToOfFieldAdapter<F>,
  ErrorOfFieldAdapter<F>,
  ValuePathOfFieldAdapter<F> extends StringConcatOf<'$', infer ValuePathSuffix> ? `${ValuePath}${ValuePathSuffix}`
    // assume string (they don't care about the value path as a type) if there the path doesn't have a $ prefix
    : string,
  Context
>

type SubFormFieldAdapters<
  SubAdapters extends Record<string, FieldAdapter>,
  TypePath extends string,
  ValuePath extends string,
  Context,
> = {
  [
    K in keyof SubAdapters as K extends StringConcatOf<'$', infer TypePathSuffix> ? `${TypePath}${TypePathSuffix}`
      : never
  ]: SubFormFieldAdapter<
    SubAdapters[K],
    ValuePath,
    Context
  >
}

export function subFormFieldAdapters<
  SubAdapters extends Record<string, FieldAdapter>,
  TypePath extends string,
  TypePathsToValuePaths extends Record<TypePath, string>,
  ContextType extends Type,
>(
  subAdapters: SubAdapters,
  parentTypePath: TypePath,
  contextType: ContextType,
): SubFormFieldAdapters<
  SubAdapters,
  TypePath,
  TypePathsToValuePaths[TypePath],
  ValueOfType<ReadonlyTypeOfType<ContextType>>
> {
  // assume the number of '.' in the type path will correspond to the number of '.' in the value path
  const dotCount = parentTypePath.split('.').length
  function getSubValuePathAndContext(valuePath: string, context: ValueOfType<ReadonlyTypeOfType<ContextType>>) {
    const parentValuePath = valuePath.split('.').slice(0, dotCount).join('.')
    const subValuePath = valuePath.replace(parentValuePath, '$')
    const subContext = flattenValuesOfType(contextType, context)[parentValuePath]
    return [
      subValuePath,
      subContext,
    ] as const
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
        return subAdapter.convert(from, ...getSubValuePathAndContext(valuePath, context))
      },
      create: (valuePath, context) => {
        return subAdapter.create(...getSubValuePathAndContext(valuePath, context))
      },
      revert: subAdapter.revert && ((from, valuePath, context) => {
        return subAdapter.revert!(from, ...getSubValuePathAndContext(valuePath, context))
      }),
    }
    acc[typePath] = adaptedAdapter
    return acc
  }, {}) as SubFormFieldAdapters<
    SubAdapters,
    TypePath,
    TypePathsToValuePaths[TypePath],
    ValueOfType<ReadonlyTypeOfType<ContextType>>
  >
}

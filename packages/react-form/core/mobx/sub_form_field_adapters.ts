import { type StringConcatOf } from '@strictly/base'
import {
  flattenValuesOfType,
  type Type,
  type ValueOfType,
} from '@strictly/define'
import {
  type ErrorOfFieldAdapter,
  type FieldAdapter,
  type FromOfFieldAdapter,
  type ToOfFieldAdapter,
} from './field_adapter'

type SubFormFieldAdapter<F extends FieldAdapter, P extends string, Context> = FieldAdapter<
  FromOfFieldAdapter<F>,
  ToOfFieldAdapter<F>,
  ErrorOfFieldAdapter<F>,
  P,
  Context
>

type SubFormFieldAdapters<SubAdapters extends Record<string, FieldAdapter>, P extends string, Context> = {
  [K in keyof SubAdapters as K extends StringConcatOf<'$', infer S> ? `${P}${S}` : never]: K extends
    StringConcatOf<'$', infer S> ? SubFormFieldAdapter<
      SubAdapters[K],
      `${P}${S}`,
      Context
    >
    : never
}

export function subFormFieldAdapters<SubAdapters extends Record<string, FieldAdapter>, P extends string,
  ContextType extends Type>(
  subAdapters: SubAdapters,
  prefix: P,
  contextType: ContextType,
): SubFormFieldAdapters<SubAdapters, P, ValueOfType<ContextType>> {
  function getSubValuePathAndContext(valuePath: string, context: ValueOfType<ContextType>) {
    const subValuePath = valuePath.replace(prefix, '$')
    const subContext = flattenValuesOfType(contextType, context)[prefix]
    return [
      subValuePath,
      subContext,
    ] as const
  }

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return Object.entries(subAdapters).reduce<Record<string, FieldAdapter>>((acc, [
    subKey,
    subValue,
  ]) => {
    const key = subKey.replace('$', prefix)
    // adapt field adapter with new path and context
    const adaptedAdapter: FieldAdapter = {
      convert: (from, valuePath, context) => {
        return subValue.convert(from, ...getSubValuePathAndContext(valuePath, context))
      },
      create: (valuePath, context) => {
        return subValue.create(...getSubValuePathAndContext(valuePath, context))
      },
      revert: subValue.revert && ((from, valuePath, context) => {
        return subValue.revert!(from, ...getSubValuePathAndContext(valuePath, context))
      }),
    }
    acc[key] = adaptedAdapter
    return acc
  }, {}) as SubFormFieldAdapters<SubAdapters, P, ValueOfType<ContextType>>
}

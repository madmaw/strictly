import { type StringConcatOf } from '@strictly/base'
import { type FieldAdapter } from './field_adapter'

type SubFormFieldAdapters<SubAdapters extends Record<string, FieldAdapter>, P extends string> = {
  [K in keyof SubAdapters as K extends StringConcatOf<'$', infer S> ? `${P}${S}` : never]: SubAdapters[K]
}

export function subFormFieldAdapters<SubAdapters extends Record<string, FieldAdapter>, P extends string>(
  subAdapters: SubAdapters,
  prefix: P,
): SubFormFieldAdapters<SubAdapters, P> {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return Object.entries(subAdapters).reduce<Record<string, FieldAdapter>>((acc, [
    subKey,
    subValue,
  ]) => {
    const key = subKey.replace('$', prefix)
    acc[key] = subValue
    return acc
  }, {}) as SubFormFieldAdapters<SubAdapters, P>
}

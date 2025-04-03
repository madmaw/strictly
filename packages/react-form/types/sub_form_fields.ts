import { type StringConcatOf } from '@strictly/base'
import { type Fields } from './field'

export type SubFormFields<F extends Fields, P extends keyof F> = P extends string ? {
    [K in keyof F as K extends StringConcatOf<`${P}.`, infer S> ? `$.${S}` : never]: F[K]
  } & { $: F[P] }
  : never

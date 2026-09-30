/* oxlint-disable typescript/no-explicit-any -- the adapters are intentionally untyped here */
import { type Fields } from './Field'
import { type ValueTypeOfField } from './ValueTypeOfField'

export type ListFieldsOfFields<F extends Fields> = {
  [
    K in keyof F as ValueTypeOfField<F[K]> extends readonly any[] ? K : never
  ]: F[K]
}

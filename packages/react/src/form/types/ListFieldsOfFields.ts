import { type Fields } from './Field'
import { type ValueTypeOfField } from './ValueTypeOfField'

export type ListFieldsOfFields<F extends Fields> = {
  [
    // oxlint-disable-next-line typescript/no-explicit-any -- the adapters are intentionally untyped here
    K in keyof F as ValueTypeOfField<F[K]> extends readonly any[] ? K : never
  ]: F[K]
}

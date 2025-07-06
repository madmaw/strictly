import { type Fields } from './Field'
import { type ValueTypeOfField } from './ValueTypeOfField'

export type StringFieldsOfFields<F extends Fields> = {
  [K in keyof F as ValueTypeOfField<F[K]> extends string | undefined | null ? K : never]: F[K]
}

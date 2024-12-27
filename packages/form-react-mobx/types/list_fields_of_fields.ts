import { type Fields } from './field'
import { type ValueTypeOfField } from './value_type_of_field'

export type ListFieldsOfFields<F extends Fields> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [K in keyof F as ValueTypeOfField<F[K]> extends readonly any[] ? K : never]: F[K]
}

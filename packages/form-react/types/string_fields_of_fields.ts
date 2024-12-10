import { type Fields } from './field'
import { type ValueTypeOfField } from './value_type_of_field'

export type StringFieldsOfFields<F extends Fields> = {
  [K in keyof F as ValueTypeOfField<F[K]> extends string | undefined | null ? K : never]: F[K]
}

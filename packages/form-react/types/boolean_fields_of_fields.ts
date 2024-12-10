import {
  type Fields,
} from './field'
import { type ValueTypeOfField } from './value_type_of_field'

export type BooleanFieldsOfFields<F extends Fields> = {
  [K in keyof F as ValueTypeOfField<F[K]> extends boolean ? K : never]: F[K]
}

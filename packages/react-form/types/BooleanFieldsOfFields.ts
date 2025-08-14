import {
  type Fields,
} from './Field'
import { type ValueTypeOfField } from './ValueTypeOfField'

export type BooleanFieldsOfFields<F extends Fields> = {
  [K in keyof F as ValueTypeOfField<F[K]> extends boolean ? K : never]: F[K]
}

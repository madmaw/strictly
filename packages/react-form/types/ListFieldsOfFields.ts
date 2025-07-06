import { type Fields } from './Field'
import { type ValueTypeOfField } from './ValueTypeOfField'

export type ListFieldsOfFields<F extends Fields> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [K in keyof F as ValueTypeOfField<F[K]> extends readonly any[] ? K : never]: F[K]
}

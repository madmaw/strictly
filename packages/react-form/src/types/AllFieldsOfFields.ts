import { type Fields } from './Field'
import { type ValueTypeOfField } from './ValueTypeOfField'

// this is a ridiculous type, but it is used for consistency and it seems to force
// the keys to be strings
export type AllFieldsOfFields<F extends Fields> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [K in keyof F as ValueTypeOfField<F[K]> extends any ? K : never]: F[K]
}

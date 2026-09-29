import { type Fields } from './Field'

/**
 * The fields keyed only by their string paths, so consumers can treat every key as a string
 */
export type AllFieldsOfFields<F extends Fields> = {
  [K in keyof F & string]: F[K]
}

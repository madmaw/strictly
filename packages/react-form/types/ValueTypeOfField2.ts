import { type Field } from './Field'

export type ValueTypeOfField<F extends Field> = F extends Field<infer V> ? V : never

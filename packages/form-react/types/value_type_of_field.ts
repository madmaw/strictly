import { type Field } from './field'

export type ValueTypeOfField<F extends Field> = F extends Field<infer _E, infer V> ? V : never

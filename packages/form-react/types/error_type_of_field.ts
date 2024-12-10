import { type Field } from './field'

export type ErrorTypeOfField<F extends Field> = F extends Field<infer E, infer _V> ? E : never

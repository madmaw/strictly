import { type Field } from './field'

export type ErrorOfField<F extends Field> = F extends Field<infer _V, infer E> ? E : never

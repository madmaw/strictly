import { type Field } from './Field'

export type ErrorOfField<F extends Field> = F extends Field<infer _V, infer E> ? E : never

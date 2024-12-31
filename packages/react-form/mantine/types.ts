import { type ComponentType } from 'react'
import { type Fields } from 'types/field'
import { type UnsafePartialComponent } from 'util/partial'
import { type ErrorRenderer } from './error_renderer'

export type MantineForm<F extends Fields> = {
  fields: F,
  onFieldValueChange: (<K extends keyof F>(this: void, key: K, value: F[K]['value']) => void) | undefined,
  onFieldFocus: ((this: void, key: keyof F) => void) | undefined,
  onFieldBlur: ((this: void, key: keyof F) => void) | undefined,
  onFieldSubmit: ((this: void, key: keyof F) => boolean | void) | undefined,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MantineFieldComponent<T, P = T, E = any> = UnsafePartialComponent<ComponentType<P>, T, {
  ErrorRenderer?: ErrorRenderer<E>,
}>

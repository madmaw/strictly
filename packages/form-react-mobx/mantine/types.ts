import { type ComponentType } from 'react'
import { type Fields } from 'types/field'
import { type UnsafePartialComponent } from 'util/partial'

export type MantineForm<F extends Fields> = {
  fields: F,
  onFieldValueChange: (<K extends keyof F>(this: void, key: K, value: F[K]['value']) => void) | undefined,
  onFieldFocus: ((this: void, key: keyof F) => void) | undefined,
  onFieldBlur: ((this: void, key: keyof F) => void) | undefined,
  onFieldSubmit: ((this: void, key: keyof F) => boolean | void) | undefined,
}

export type MantineFieldComponent<T, P = T> = UnsafePartialComponent<ComponentType<P>, T>

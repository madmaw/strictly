import {
  type ComponentType,
} from 'react'
import { type Fields } from 'types/Field'
import {
  type RefOfProps,
  type UnsafePartialComponent,
} from 'util/Partial'
import { type ErrorRenderer } from './ErrorRenderer'

export type MantineForm<F extends Fields> = {
  fields: F,
  onFieldValueChange: (<K extends keyof F>(this: void, key: K, value: F[K]['value']) => void) | undefined,
  onFieldFocus: ((this: void, key: keyof F) => void) | undefined,
  onFieldBlur: ((this: void, key: keyof F) => void) | undefined,
  onFieldSubmit: ((this: void, key: keyof F) => boolean | void) | undefined,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MantineFieldComponent<T, P = T, E = any, R = RefOfProps<P>> = UnsafePartialComponent<
  ComponentType<P>,
  T,
  // escape hatch for never comparisons `E extends never` will not work, always returning never
  // https://github.com/microsoft/TypeScript/issues/31751
  [E] extends [never] ? {} : { ErrorRenderer: ErrorRenderer<E> },
  // mantine types are too complex for us to be able to get a stable type for the ref.
  // We can, however, do a best guess and allow overriding in the caller
  R
>

import { type Fields } from 'form/types/Field'
import { type RefOfProps, type UnsafePartialComponent } from 'form/util/Partial'
import { type ComponentType } from 'react'
import { type ErrorRenderer } from './ErrorRenderer'

export type MantineForm<F extends Fields> = {
  fields: F
  onFieldValueChange: <K extends keyof F>(
    this: void,
    key: K,
    value: F[K]['value'],
  ) => void
  onFieldFocus?: (this: void, key: keyof F) => void
  onFieldBlur?: (this: void, key: keyof F) => void
  onFieldSubmit?: (this: void, key: keyof F) => boolean | void
}

export type MantineFieldComponent<
  T,
  P = T,
  E = any, // oxlint-disable-line typescript/no-explicit-any
  R = RefOfProps<P>,
> = UnsafePartialComponent<
  ComponentType<P>,
  T,
  // escape hatch for never comparisons `E extends never` will not work, always returning never
  // https://github.com/microsoft/TypeScript/issues/31751
  [E] extends [never] ? {} : { ErrorRenderer: ErrorRenderer<E> },
  // mantine types are too complex for us to be able to get a stable type for the ref.
  // We can, however, do a best guess and allow overriding in the caller
  R
>

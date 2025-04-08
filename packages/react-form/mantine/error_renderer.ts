import { type ComponentType } from 'react'
import { type ErrorOfField } from 'types/error_of_field'
import { type Fields } from 'types/field'

type InternalErrorRendererProps<E> = {
  error: E,
}

export type ErrorRendererProps<
  F extends Fields,
  K extends keyof Fields,
> = InternalErrorRendererProps<
  ErrorOfField<F[K]>
>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ErrorRenderer<E = any> = ComponentType<InternalErrorRendererProps<E>>

export function DefaultErrorRenderer({
  error,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}: InternalErrorRendererProps<any>) {
  return JSON.stringify(error)
}

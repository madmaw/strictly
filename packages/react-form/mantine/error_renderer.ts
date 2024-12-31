import { type ComponentType } from 'react'

export type ErrorRendererProps<E> = {
  error: E,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ErrorRenderer<E = any> = ComponentType<ErrorRendererProps<E>>

export function DefaultErrorRenderer({
  error,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}: ErrorRendererProps<any>) {
  return error
}

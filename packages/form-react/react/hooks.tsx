import {
  type ChangeEvent,
  useCallback,
  useMemo,
} from 'react'
import {
  type ErrorTypeOfFormField,
  type Field,
} from 'types/field'
import {
  type FormProps,
} from './props'

export type ErrorRendererProps<E> = {
  error: E,
}

export type ErrorRenderer<E> = React.ComponentType<ErrorRendererProps<E>>

function DefaultErrorRenderer({
  error,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}: ErrorRendererProps<any>) {
  return error
}

export function useFormInput<
  K extends string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Fields extends Readonly<Record<K, Field<any, string>>>,
>(
  k: K,
  {
    onFieldValueChange,
    onFieldBlur,
    onFieldFocus,
    onFieldSubmit,
    fields,
  }: FormProps<Fields>,
  ErrorRenderer: ErrorRenderer<ErrorTypeOfFormField<Fields[K]>> = DefaultErrorRenderer,
) {
  const onChange = useCallback(function (e: ChangeEvent<HTMLInputElement>) {
    onFieldValueChange(k, e.target.value)
  }, [
    k,
    onFieldValueChange,
  ])
  const onFocus = useCallback(function () {
    onFieldFocus?.(k)
  }, [
    k,
    onFieldFocus,
  ])
  const onBlur = useCallback(function () {
    onFieldBlur?.(k)
  }, [
    k,
    onFieldBlur,
  ])
  const onKeyUp = useCallback(function (e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      if (onFieldSubmit?.(k)) {
        e.preventDefault()
      }
    }
  }, [
    k,
    onFieldSubmit,
  ])

  const {
    value,
    error,
    disabled,
  } = fields[k]

  const renderedError = useMemo(function () {
    return error && <ErrorRenderer error={error} />
  }, [
    ErrorRenderer,
    error,
  ])

  return {
    name: k,
    onChange,
    onFocus,
    onBlur,
    onKeyUp,
    value,
    error: renderedError,
    disabled,
  }
}

export function useFormCheckBox<
  K extends string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Fields extends Readonly<Record<K, Field<any, boolean>>>,
>(
  k: K,
  {
    onFieldValueChange,
    onFieldBlur,
    onFieldFocus,
    fields,
  }: FormProps<Fields>,
  ErrorRenderer: ErrorRenderer<ErrorTypeOfFormField<Fields[K]>> = DefaultErrorRenderer,
) {
  const onChange = useCallback(function (e: ChangeEvent<HTMLInputElement>) {
    onFieldValueChange(k, e.target.checked)
  }, [
    k,
    onFieldValueChange,
  ])
  const onFocus = useCallback(function () {
    onFieldFocus?.(k)
  }, [
    k,
    onFieldFocus,
  ])
  const onBlur = useCallback(function () {
    onFieldBlur?.(k)
  }, [
    k,
    onFieldBlur,
  ])
  const {
    value,
    error,
    disabled,
  } = fields[k]

  const renderedError = useMemo(function () {
    return error && <ErrorRenderer error={error} />
  }, [
    ErrorRenderer,
    error,
  ])

  return {
    name: k,
    onChange,
    onFocus,
    onBlur,
    checked: value,
    error: renderedError,
    disabled,
  }
}

export function useFormRadioGroup<
  K extends string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Fields extends Readonly<Record<K, Field<any, string>>>,
>(
  k: K,
  {
    onFieldValueChange,
    onFieldBlur,
    onFieldFocus,
    fields,
  }: FormProps<Fields>,
  ErrorRenderer: ErrorRenderer<ErrorTypeOfFormField<Fields[K]>> = DefaultErrorRenderer,
) {
  const onChange = useCallback(function (value: string) {
    onFieldValueChange(k, value)
  }, [
    k,
    onFieldValueChange,
  ])
  const onFocus = useCallback(function () {
    onFieldFocus?.(k)
  }, [
    k,
    onFieldFocus,
  ])
  const onBlur = useCallback(function () {
    onFieldBlur?.(k)
  }, [
    k,
    onFieldBlur,
  ])

  const {
    value,
    error,
    disabled,
  } = fields[k]

  const renderedError = useMemo(function () {
    return error && <ErrorRenderer error={error} />
  }, [
    ErrorRenderer,
    error,
  ])

  return {
    name: k,
    onChange,
    onFocus,
    onBlur,
    value,
    error: renderedError,
    disabled,
  }
}

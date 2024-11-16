import { type ReadonlyRecord } from '@de/base'
import {
  type ChangeEvent,
  useCallback,
} from 'react'
import {
  type FormField,
  type FormProps,
} from './props'

export function useFormInput<
  Fields extends ReadonlyRecord<string, FormField<string, string>>,
>(
  k: keyof Fields,
  {
    onFieldValueChange,
    onFieldBlur,
    onFieldFocus,
    fields,
  }: FormProps<Fields>,
) {
  const onChange = useCallback(function (e: ChangeEvent<HTMLInputElement>) {
    onFieldValueChange(k, e.target.value)
  }, [
    k,
    onFieldValueChange,
  ])
  const onFocus = useCallback(function () {
    onFieldFocus(k)
  }, [
    k,
    onFieldFocus,
  ])
  const onBlur = useCallback(function () {
    onFieldBlur(k)
  }, [
    k,
    onFieldBlur,
  ])
  const {
    value,
    error,
    disabled,
  } = fields[k]

  return {
    onChange,
    onFocus,
    onBlur,
    value,
    error,
    disabled,
  }
}

export function useFormCheckBox<
  Fields extends ReadonlyRecord<string, FormField<boolean, string>>,
>(
  k: keyof Fields,
  {
    onFieldValueChange,
    onFieldBlur,
    onFieldFocus,
    fields,
  }: FormProps<Fields>,
) {
  const onChange = useCallback(function (e: ChangeEvent<HTMLInputElement>) {
    onFieldValueChange(k, e.target.checked)
  }, [
    k,
    onFieldValueChange,
  ])
  const onFocus = useCallback(function () {
    onFieldFocus(k)
  }, [
    k,
    onFieldFocus,
  ])
  const onBlur = useCallback(function () {
    onFieldBlur(k)
  }, [
    k,
    onFieldBlur,
  ])
  const {
    value,
    error,
    disabled,
  } = fields[k]

  return {
    onChange,
    onFocus,
    onBlur,
    checked: value,
    error,
    disabled,
  }
}

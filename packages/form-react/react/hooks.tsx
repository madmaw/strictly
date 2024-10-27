import { type ReadonlyRecord } from '@de/fine/util/record'
import {
  type ChangeEvent,
  useCallback,
} from 'react'
import {
  type FormField,
  type FormProps,
} from './props'

export function useFormInput<K extends string, Fields extends ReadonlyRecord<K, FormField<string, string>>>(
  k: K,
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
  } = fields[k]

  return {
    onChange,
    onFocus,
    onBlur,
    value,
    error,
  }
}

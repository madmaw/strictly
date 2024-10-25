import { type ReadonlyRecord } from '@tscriptors/core/util/record'
import {
  type ChangeEvent,
  useCallback,
} from 'react'
import {
  type Field,
  type FormProps,
} from 'types'

export function useFormInput<K extends string, Fields extends ReadonlyRecord<K, Field<string>>>(
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
  const { value } = fields[k]

  return {
    onChange,
    onFocus,
    onBlur,
    value,
  }
}

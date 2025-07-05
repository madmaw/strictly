import { Observer } from 'mobx-react'
import {
  type ComponentType,
  useCallback,
} from 'react'
import { type AllFieldsOfFields } from 'types/AllFieldsOfFields'
import { type ErrorOfField } from 'types/ErrorOfField'
import { type Fields } from 'types/Field'
import { type ValueTypeOfField } from 'types/ValueTypeOfField'
import { Empty } from 'util/Empty'
import { type MantineForm } from './Types'

export type FieldViewProps<F extends Fields, K extends keyof F> = {
  children: (props: {
    value: ValueTypeOfField<F[K]>,
    error: ErrorOfField<F[K]> | undefined,
    ErrorSink: ComponentType<{ error: ErrorOfField<F[K]> }>,
    onFocus: () => void,
    onBlur: () => void,
    onValueChange: (v: ValueTypeOfField<F[K]>) => void,
    onSubmit: () => void,
  }) => JSX.Element,
}

/**
 * Displays current value and error of a field
 */
function FieldView<F extends Fields, K extends keyof F>({
  valuePath,
  form,
  children,
}: FieldViewProps<F, K> & {
  valuePath: K,
  form: MantineForm<F>,
}) {
  const onFocus = useCallback(() => {
    form.onFieldFocus?.(valuePath)
  }, [
    form,
    valuePath,
  ])
  const onBlur = useCallback(() => {
    form.onFieldBlur?.(valuePath)
  }, [
    form,
    valuePath,
  ])
  const onValueChange = useCallback((value: ValueTypeOfField<F[K]>) => {
    form.onFieldValueChange?.(valuePath, value)
  }, [
    form,
    valuePath,
  ])
  const onSubmit = useCallback(() => {
    form.onFieldSubmit?.(valuePath)
  }, [
    form,
    valuePath,
  ])
  return (
    <Observer>
      {() => {
        const {
          value,
          error,
        } = form.fields[valuePath]
        return children({
          value,
          error,
          ErrorSink: Empty,
          onFocus,
          onBlur,
          onValueChange,
          onSubmit,
        })
      }}
    </Observer>
  )
}

export function createFieldView<
  F extends Fields,
  K extends keyof AllFieldsOfFields<F>,
>(this: MantineForm<F>, valuePath: K): ComponentType<FieldViewProps<F, K>> {
  return (props: FieldViewProps<F, K>) => {
    return (
      <FieldView
        form={this}
        valuePath={valuePath}
        {...props}
      />
    )
  }
}

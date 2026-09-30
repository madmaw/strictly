import { type StringKeyOf } from '@strictly/base'
import { type FieldsViewProps, type FormProps } from 'form/core/props'
import { type Fields } from 'form/types/Field'
import { type ValueTypeOfField } from 'form/types/ValueTypeOfField'
import { observer } from 'mobx-react'
import { type ComponentProps, type ComponentType } from 'react'
import { type MantineFieldComponent } from './types'

export function createForm<
  F extends Fields,
  K extends StringKeyOf<F>,
  P extends FormProps<ValueTypeOfField<F[K]>> = FormProps<
    ValueTypeOfField<F[K]>
  >,
>(
  valuePath: K,
  Form: ComponentType<P>,
  observableProps: FieldsViewProps<F>,
): MantineFieldComponent<FormProps<ValueTypeOfField<F[K]>>, P, never> {
  function onValueChange(value: ValueTypeOfField<F[K]>) {
    observableProps.onFieldValueChange(valuePath, value)
  }
  return observer(
    (
      props: ComponentProps<
        MantineFieldComponent<FormProps<ValueTypeOfField<F[K]>>, P>
      >,
    ) => {
      const { value } = observableProps.fields[valuePath]
      return (
        <Form
          {
            // maybe we can do this in a more type safe way
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ...(props as any)
          }
          onValueChange={onValueChange}
          value={value}
        />
      )
    },
  ) as MantineFieldComponent<FormProps<ValueTypeOfField<F[K]>>, P, never>
}

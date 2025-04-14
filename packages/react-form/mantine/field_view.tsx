import { Observer } from 'mobx-react'
import { type ComponentType } from 'react'
import { type ErrorOfField } from 'types/error_of_field'
import { type Fields } from 'types/field'
import { type ValueTypeOfField } from 'types/value_type_of_field'
import { Empty } from 'util/empty'

/**
 * Displays current value and error of a field
 */
export function FieldView<F extends Fields, K extends keyof F>({
  fields,
  valuePath,
  children,
}: {
  fields: F,
  valuePath: K,
  children: (props: {
    value: ValueTypeOfField<F[K]>,
    error: ErrorOfField<F[K]> | undefined,
    ErrorSink: ComponentType<{ error: ErrorOfField<F[K]> }>,
  }) => JSX.Element,
}) {
  return (
    <Observer>
      {() => {
        const {
          value,
          error,
        } = fields[valuePath]
        return children({
          value,
          error,
          ErrorSink: Empty,
        })
      }}
    </Observer>
  )
}

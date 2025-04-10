import {
  type ReadonlyTypeOfType,
  type ValueOfType,
} from '@strictly/define'
import {
  useCallback,
} from 'react'
import { type FormModel } from './form_model'
import {
  type FormFieldsOfModel,
  type ToValueOfModelValuePath,
  type ValuePathsOfModel,
} from './types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ValueOfModel<M extends FormModel<any, any, any, any>> = M extends FormModel<infer T, any, any, any>
  ? ValueOfType<ReadonlyTypeOfType<T>>
  : never

export function useDefaultMobxFormHooks<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  M extends FormModel<any, any, any, any>,
  F extends FormFieldsOfModel<M> = FormFieldsOfModel<M>,
>(
  model: M,
  {
    onValidFieldSubmit,
    onValidFormSubmit,
  }: {
    onValidFieldSubmit?: <Path extends ValuePathsOfModel<M>>(valuePath: Path) => void,
    onValidFormSubmit?: (value: ValueOfModel<M>) => void,
  } = {},
): {
  onFormSubmit: () => void,
  onFieldValueChange<K extends keyof F>(this: void, key: K, value: F[K]['value']): void,
  onFieldFocus?(this: void, key: keyof F): void,
  onFieldBlur?(this: void, key: keyof F): void,
  onFieldSubmit?(this: void, key: keyof F): boolean | void,
} {
  const onFieldValueChange = useCallback(
    function<Path extends ValuePathsOfModel<M>> (
      path: Path,
      value: ToValueOfModelValuePath<M, Path>,
    ) {
      // TODO do in one action
      model.clearFieldError(path)
      model.setFieldValue<Path>(path, value)
    },
    [model],
  )

  const onFieldSubmit = useCallback(
    function<Path extends ValuePathsOfModel<M>> (valuePath: Path) {
      if (model.validateField(valuePath)) {
        onValidFieldSubmit?.(valuePath)
      }
      return false
    },
    [
      model,
      onValidFieldSubmit,
    ],
  )

  const onFieldBlur = useCallback(
    function<Path extends ValuePathsOfModel<M>> (path: Path) {
      // work around potential loss of focus prior to state potentially invalidating change triggering
      // (e.g. changing a discriminator)
      // TODO debounce?
      setTimeout(function () {
        if (model.isValuePathActive(path)) {
          model.validateField(path, true)
        }
      }, 100)
    },
    [model],
  )

  const onFormSubmit = useCallback(
    function () {
      if (model.validateAll()) {
        onValidFormSubmit?.(model.value)
      }
    },
    [
      model,
      onValidFormSubmit,
    ],
  )

  // TODO have option to automatically bind all these callbacks to a FieldsView parameter

  return {
    onFieldValueChange,
    onFieldSubmit,
    onFieldBlur,
    onFormSubmit,
  }
}

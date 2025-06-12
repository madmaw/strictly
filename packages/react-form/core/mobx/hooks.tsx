import {
  type ReadonlyTypeOfType,
  type ValueOfType,
} from '@strictly/define'
import {
  useCallback,
} from 'react'
import type { ValueTypeOfField } from 'types/value_type_of_field'
import {
  type FormModel,
  Validation,
} from './form_model'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ValueOfModel<M extends FormModel<any, any, any, any, any>> = M extends FormModel<infer T, any, any, any, any>
  ? ValueOfType<ReadonlyTypeOfType<T>>
  : never

export function useDefaultMobxFormHooks<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  M extends FormModel<any, any, any, any, any>,
  F extends M['fields'] = M['fields'],
>(
  model: M,
  {
    onValidFieldSubmit,
    onValidFormSubmit,
  }: {
    onValidFieldSubmit?: <Path extends keyof F>(valuePath: Path) => void,
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
    function<Path extends keyof F> (
      path: Path,
      value: ValueTypeOfField<F[Path]>,
    ) {
      const validation = Math.min(model.getValidation(path), Validation.Changed)
      model.setFieldValue<Path>(path, value, validation)
    },
    [model],
  )

  const onFieldSubmit = useCallback(
    function<Path extends keyof F> (valuePath: Path) {
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
    function<Path extends keyof F> (path: Path) {
      // work around potential loss of focus prior to state potentially invalidating change triggering
      // (e.g. changing a discriminator)
      // TODO debounce?
      setTimeout(function () {
        // only start validation if the user has changed the field and there isn't already an error visible
        if (model.isValuePathActive(path) && model.isFieldDirty(path) && model.fields[path].error == null) {
          // further workaround to make sure we don't downgrade the existing validation
          model.validateField(path, Math.max(Validation.Changed, model.getValidation(path)))
        }
      }, 100)
    },
    [model],
  )

  const onFormSubmit = useCallback(
    function () {
      if (model.validateSubmit()) {
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

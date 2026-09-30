import {
  type ReadonlyTypeOfType,
  type Type,
  type ValueOfType,
} from '@strictly/base'
import type { ValueTypeOfField } from 'form/types/ValueTypeOfField'
import { useCallback } from 'react'
import { type FormModel, Validation } from './FormModel'
import { peek } from './peek'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FormModelInterface<T extends Type = any> = Pick<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  FormModel<T, any, any, any, any, any>,
  | 'type'
  | 'fields'
  | 'value'
  | 'getValidation'
  | 'validateField'
  | 'setFieldValue'
  | 'validateSubmit'
  | 'isFieldDirty'
  | 'isValuePathActive'
>

type ValueOfModel<M extends FormModelInterface> = ValueOfType<
  ReadonlyTypeOfType<M['type']>
>

export function useDefaultMobxFormHooks<
  M extends FormModelInterface,
  F extends M['fields'] = M['fields'],
>(
  model: M,
  {
    onValidFieldSubmit,
    onValidFormSubmit,
  }: {
    onValidFieldSubmit?: <Path extends keyof F>(valuePath: Path) => void
    onValidFormSubmit?: (value: ValueOfModel<M>) => void
  } = {},
): {
  onFormSubmit: () => void
  onFieldValueChange<K extends keyof F>(
    this: void,
    key: K,
    value: F[K]['value'],
  ): void
  onFieldFocus?(this: void, key: keyof F): void
  onFieldBlur?(this: void, key: keyof F): void
  onFieldSubmit?(this: void, key: keyof F): boolean | void
} {
  const onFieldValueChange = useCallback(
    <Path extends keyof F>(path: Path, value: ValueTypeOfField<F[Path]>) => {
      const activeValidation = peek(() => model.getValidation(path))
      const validation = Math.min(activeValidation, Validation.Changed)
      model.setFieldValue<Path>(path, value, validation)
    },
    [model],
  )

  const onFieldSubmit = useCallback(
    <Path extends keyof F>(valuePath: Path) => {
      if (model.validateField(valuePath)) {
        onValidFieldSubmit?.(valuePath)
      }
      return false
    },
    [model, onValidFieldSubmit],
  )

  const onFieldBlur = useCallback(
    <Path extends keyof F>(path: Path) => {
      // work around potential loss of focus prior to state potentially invalidating change triggering
      // (e.g. changing a discriminator)
      // TODO debounce?
      setTimeout(() => {
        const [validate, activeValidation] = peek(() => [
          model.isValuePathActive(path) &&
            model.isFieldDirty(path) &&
            model.fields[path].error == null,
          model.getValidation(path),
        ])
        // only start validation if the user has changed the field and there isn't already an error visible
        if (validate) {
          const validation = Math.max(Validation.Changed, activeValidation)
          // further workaround to make sure we don't downgrade the existing validation
          model.validateField(path, validation)
        }
      }, 100)
    },
    [model],
  )

  const onFormSubmit = useCallback(() => {
    const valid = peek(() => model.validateSubmit())
    if (valid && onValidFormSubmit) {
      const value = peek(() => model.value)
      onValidFormSubmit(value)
    }
  }, [model, onValidFormSubmit])

  // TODO have option to automatically bind all these callbacks to a FieldsView parameter

  return {
    onFieldValueChange,
    onFieldSubmit,
    onFieldBlur,
    onFormSubmit,
  }
}

import {
  type ReadonlyTypeOfType,
  type ValueOfType,
} from '@strictly/define'
import { type FieldsViewProps } from 'core/props'
import {
  useCallback,
  useMemo,
} from 'react'
import { type FormPresenter } from './form_presenter'
import {
  type ToValueOfPresenterValuePath,
  type ValuePathsOfPresenter,
} from './types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ValueOfPresenter<P extends FormPresenter<any, any, any, any>> = P extends FormPresenter<infer T, any, any, any>
  ? ValueOfType<ReadonlyTypeOfType<T>>
  : never

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ModelOfPresenter<P extends FormPresenter<any, any, any, any>> = ReturnType<P['createModel']>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useDefaultMobxFormHooks<P extends FormPresenter<any, any, any, any>>(
  presenter: P,
  value: ValueOfPresenter<P>,
  {
    onValidFieldSubmit,
    onValidFormSubmit,
  }: {
    onValidFieldSubmit?: <Path extends ValuePathsOfPresenter<P>>(model: ModelOfPresenter<P>, valuePath: Path) => void,
    onValidFormSubmit?: (model: ModelOfPresenter<P>, value: ValueOfPresenter<P>) => void,
  },
): {
  model: ModelOfPresenter<P>,
  onFormSubmit?: (value: ValueOfPresenter<P>) => void,
} & Omit<FieldsViewProps<ModelOfPresenter<P>['fields']>, 'fields'> {
  const model = useMemo(function () {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return presenter.createModel(value) as ReturnType<P['createModel']>
  }, [
    presenter,
    value,
  ])

  const onFieldValueChange = useCallback(
    function<Path extends ValuePathsOfPresenter<P>> (
      path: Path,
      value: ToValueOfPresenterValuePath<P, Path>,
    ) {
      presenter.clearFieldError(model, path)
      presenter.setFieldValue<Path>(model, path, value)
    },
    [
      presenter,
      model,
    ],
  )

  const onFieldSubmit = useCallback(
    function<Path extends ValuePathsOfPresenter<P>> (valuePath: Path) {
      if (presenter.validateField(model, valuePath)) {
        onValidFieldSubmit?.(model, valuePath)
      }
      return false
    },
    [
      presenter,
      model,
      onValidFieldSubmit,
    ],
  )

  const onFieldBlur = useCallback(
    function<Path extends ValuePathsOfPresenter<P>> (path: Path) {
      // work around potential loss of focus prior to state potentially invalidating change triggering
      // (e.g. changing a discriminator)
      // TODO debounce?
      setTimeout(function () {
        if (presenter.isValuePathActive(model, path)) {
          presenter.validateField(model, path)
        }
      }, 100)
    },
    [
      presenter,
      model,
    ],
  )

  const onFormSubmit = useCallback(
    function () {
      if (presenter.validateAll(model)) {
        onValidFormSubmit?.(model, model.value)
      }
    },
    [
      presenter,
      model,
      onValidFormSubmit,
    ],
  )

  return {
    model,
    onFieldValueChange,
    onFieldSubmit,
    onFieldBlur,
    onFormSubmit,
  }
}

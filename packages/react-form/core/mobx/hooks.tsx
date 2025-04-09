import {
  type ReadonlyTypeOfType,
  type ValueOfType,
} from '@strictly/define'
import {
  type FieldsViewProps,
} from 'core/props'
import {
  type ComponentType,
  useCallback,
  useMemo,
} from 'react'
import {
  createUnsafePartialObserverComponent,
  type UnsafePartialComponent,
} from 'util/partial'
import { type FormPresenter } from './form_presenter'
import {
  type FormFieldsOfPresenter,
  type ToValueOfPresenterValuePath,
  type ValuePathsOfPresenter,
} from './types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ValueOfPresenter<P extends FormPresenter<any, any, any, any>> = P extends FormPresenter<infer T, any, any, any>
  ? ValueOfType<ReadonlyTypeOfType<T>>
  : never

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ModelOfPresenter<P extends FormPresenter<any, any, any, any>> = ReturnType<P['createModel']>

export function useDefaultMobxFormHooks<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  P extends FormPresenter<any, any, any, any>,
  C extends ComponentType<FieldsViewProps<F>>,
  F extends FormFieldsOfPresenter<P> = FormFieldsOfPresenter<P>,
>(
  presenter: P,
  value: ValueOfPresenter<P>,
  options?: {
    onValidFieldSubmit?: <Path extends ValuePathsOfPresenter<P>>(model: ModelOfPresenter<P>, valuePath: Path) => void,
    onValidFormSubmit?: (model: ModelOfPresenter<P>, value: ValueOfPresenter<P>) => void,
  },
): {
  model: ModelOfPresenter<P>,
  FormFields?: UnsafePartialComponent<C, FieldsViewProps<F>>,
  onFormSubmit: () => void,
  onFieldValueChange<K extends keyof F>(this: void, key: K, value: F[K]['value']): void,
  onFieldFocus?(this: void, key: keyof F): void,
  onFieldBlur?(this: void, key: keyof F): void,
  onFieldSubmit?(this: void, key: keyof F): boolean | void,
}
export function useDefaultMobxFormHooks<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  P extends FormPresenter<any, any, any, any>,
  C extends ComponentType<FieldsViewProps<F>>,
  F extends FormFieldsOfPresenter<P> = FormFieldsOfPresenter<P>,
>(
  presenter: P,
  value: ValueOfPresenter<P>,
  options: {
    onValidFieldSubmit?: <Path extends ValuePathsOfPresenter<P>>(model: ModelOfPresenter<P>, valuePath: Path) => void,
    onValidFormSubmit?: (model: ModelOfPresenter<P>, value: ValueOfPresenter<P>) => void,
    FormFieldsView: C,
  },
): {
  model: ModelOfPresenter<P>,
  FormFields: UnsafePartialComponent<C, FieldsViewProps<F>>,
  onFormSubmit: () => void,
  onFieldValueChange<K extends keyof F>(this: void, key: K, value: F[K]['value']): void,
  onFieldFocus?(this: void, key: keyof F): void,
  onFieldBlur?(this: void, key: keyof F): void,
  onFieldSubmit?(this: void, key: keyof F): boolean | void,
}
export function useDefaultMobxFormHooks<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  P extends FormPresenter<any, any, any, any>,
  C extends FieldsViewProps<F>,
  F extends FormFieldsOfPresenter<P> = FormFieldsOfPresenter<P>,
>(
  presenter: P,
  value: ValueOfPresenter<P>,
  {
    onValidFieldSubmit,
    onValidFormSubmit,
    FormFieldsView,
  }: {
    onValidFieldSubmit?: <Path extends ValuePathsOfPresenter<P>>(model: ModelOfPresenter<P>, valuePath: Path) => void,
    onValidFormSubmit?: (model: ModelOfPresenter<P>, value: ValueOfPresenter<P>) => void,
    FormFieldsView?: ComponentType<C>,
  } = {},
): {
  model: ModelOfPresenter<P>,
  FormFields?: UnsafePartialComponent<ComponentType<C>, FieldsViewProps<F>> | undefined,
  onFormSubmit: () => void,
  onFieldValueChange<K extends keyof F>(this: void, key: K, value: F[K]['value']): void,
  onFieldFocus?(this: void, key: keyof F): void,
  onFieldBlur?(this: void, key: keyof F): void,
  onFieldSubmit?(this: void, key: keyof F): boolean | void,
} {
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
          presenter.validateField(model, path, true)
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

  const FormFields = useMemo(() => {
    if (FormFieldsView == null) {
      return undefined
    }
    return createUnsafePartialObserverComponent(FormFieldsView, (): FieldsViewProps<F> => {
      return {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        fields: model.fields as C['fields'],
        onFieldBlur,
        onFieldSubmit,
        onFieldValueChange,
      }
    })
  }, [
    model,
    FormFieldsView,
    onFieldBlur,
    onFieldSubmit,
    onFieldValueChange,
  ])

  return {
    model,
    onFieldValueChange,
    onFieldSubmit,
    onFieldBlur,
    onFormSubmit,
    FormFields,
  }
}

import { usePartialObserverComponent } from '@de/form-react/util/partial'
import {
  useCallback,
  useMemo,
} from 'react'
import { PetForm } from './pet_form'
import {
  PetFormModel,
  PetFormPresenter,
} from './pet_form_presenter'
import {
  type FlattenedPetValueTypes,
  type PetTypePaths,
  type PetValuePaths,
} from './types'

export function install() {
  const presenter = new PetFormPresenter()

  return function () {
    const model = useMemo(function () {
      return new PetFormModel({
        name: '',
        alive: true,
      })
    }, [])

    const onFieldValueChange = useCallback(
      function (
        path: PetValuePaths,
        value: FlattenedPetValueTypes[PetTypePaths],
      ) {
        presenter.onFieldValueChange(model, path, value)
      },
      [model],
    )

    const onSubmit = useCallback(
      function () {
        presenter.validate(model)
      },
      [model],
    )

    const onFieldBlur = useCallback(
      function () {
      },
      [],
    )

    const onFieldFocus = useCallback(
      function () {
      },
      [],
    )

    const Form = usePartialObserverComponent(
      function () {
        return {
          fields: model.fields,
          onFieldBlur,
          onFieldFocus,
          onFieldValueChange,
          onSubmit,
        }
      },
      [
        model,
        onFieldBlur,
        onFieldFocus,
        onFieldValueChange,
        onSubmit,
      ],
      PetForm,
    )

    return <Form />
  }
}

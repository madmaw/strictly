import {
  type PathsOfPresenterFields,
  type ValueTypeOfPresenterField,
} from '@de/form-react/react/mobx/types'
import { usePartialObserverComponent } from '@de/form-react/util/partial'
import { PetForm } from 'features/form/pet/pet_form'
import {
  useCallback,
  useMemo,
} from 'react'
import {
  AssistedPetFormPresenter,
} from './assisted_pet_form_presenter'

export function install() {
  const presenter = new AssistedPetFormPresenter()

  return function () {
    const model = useMemo(function () {
      return presenter.createModel({
        alive: true,
        name: 'Delta',
      })
    }, [])

    const onFieldValueChange = useCallback(
      function<Path extends PathsOfPresenterFields<typeof presenter>> (
        path: Path,
        value: ValueTypeOfPresenterField<typeof presenter, Path>,
      ) {
        presenter.setFieldValueAndValidate(model, path, value)
      },
      [model],
    )

    const onSubmit = useCallback(
      function () {
        presenter.validate(model)
      },
      [model],
    )

    const Form = usePartialObserverComponent(
      function () {
        return {
          fields: model.fields,
          onFieldValueChange,
          onSubmit,
        }
      },
      [
        model,
        onFieldValueChange,
        onSubmit,
      ],
      PetForm,
    )

    return <Form />
  }
}

import { usePartialObserverComponent } from '@de/form-react/util/partial'
import { PetForm } from 'features/form/pet/pet_form'
import {
  type FlattenedPetValueTypes,
  type PetTypePaths,
  type PetValuePaths,
} from 'features/form/pet/types'
import {
  useCallback,
  useMemo,
} from 'react'
import {
  ManualPetFormModel,
  ManualPetFormPresenter,
} from './manual_pet_form_presenter'

export function install() {
  const presenter = new ManualPetFormPresenter()

  return function () {
    const model = useMemo(function () {
      return new ManualPetFormModel({
        name: '',
        alive: true,
        species: {
          type: 'cat',
          meows: 1,
        },
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

    const SpeciesComponent = useCallback(function () {
      // TODO
      return null
    }, [])

    const Form = usePartialObserverComponent(
      function () {
        return {
          fields: model.fields,
          onFieldValueChange,
          onSubmit,
          SpeciesComponent,
        }
      },
      [
        model,
        onFieldValueChange,
        onSubmit,
        SpeciesComponent,
      ],
      PetForm,
    )

    return <Form />
  }
}

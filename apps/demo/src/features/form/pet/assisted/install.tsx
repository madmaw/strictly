import {
  type RenderTypeOfPresenterValuePath,
  type ValuePathsOfPresenter,
} from '@de/form-react/react/mobx/types'
import { usePartialObserverComponent } from '@de/form-react/util/partial'
import { PetForm as PetFormImpl } from 'features/form/pet/pet_form'
import { SpeciesForm as SpeciesFormImpl } from 'features/form/pet/species_form'
import { type Species } from 'features/form/pet/types'
import {
  type ComponentType,
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
        species: {
          type: 'cat',
          meows: 1000,
        },
      })
    }, [])

    const onFieldValueChange = useCallback(
      function<Path extends ValuePathsOfPresenter<typeof presenter>> (
        path: Path,
        value: RenderTypeOfPresenterValuePath<typeof presenter, Path>,
      ) {
        presenter.clearFieldError(model, path)
        presenter.setFieldValue(model, path, value)
      },
      [model],
    )

    const onFieldSubmit = useCallback(
      function<Path extends ValuePathsOfPresenter<typeof presenter>> (path: Path) {
        if (presenter.validateField(model, path)) {
          // if it successfully validates
          // TODO move to next field
        }
        return false
      },
      [model],
    )

    const onFieldBlur = useCallback(
      function<Path extends ValuePathsOfPresenter<typeof presenter>> (path: Path) {
        presenter.validateField(model, path)
      },
      [model],
    )

    const onSubmit = useCallback(
      function () {
        if (presenter.validateAndMaybeSaveAll(model)) {
          // TODO fire an event with the successfully created value
          // eslint-disable-next-line no-console
          console.log(model.value)
        }
      },
      [model],
    )

    const speciesComponents = useMemo<Record<Species, ComponentType>>(function () {
      return {
        cat: function () {
          // TODO
          return null
        },
        dog: function () {
          // TODO
          return null
        },
      }
    }, [])

    const SpeciesComponent = usePartialObserverComponent(
      function () {
        return {
          fields: model.fields,
          onFieldValueChange,
          onSubmit,
          onFieldSubmit,
          onFieldBlur,
          speciesComponents,
        }
      },
      [
        model,
        onFieldValueChange,
        onSubmit,
        onFieldSubmit,
        onFieldBlur,
        speciesComponents,
      ],
      SpeciesFormImpl,
    )

    const PetForm = usePartialObserverComponent(
      function () {
        return {
          fields: model.fields,
          onFieldValueChange,
          onSubmit,
          onFieldSubmit,
          onFieldBlur,
          SpeciesComponent,
        }
      },
      [
        model,
        onFieldValueChange,
        onSubmit,
        onFieldSubmit,
        onFieldBlur,
        SpeciesComponent,
      ],
      PetFormImpl,
    )

    return <PetForm />
  }
}

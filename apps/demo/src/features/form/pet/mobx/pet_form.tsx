import {
  type FormProps,
  type ToValueOfPresenterValuePath,
  usePartialObserverComponent,
  type ValuePathsOfPresenter,
} from '@strictly/react-form'
import { PetFieldsView as PetFormImpl } from 'features/form/pet/pet_fields_view'
import { PetSpeciesCatFieldsView } from 'features/form/pet/pet_species_cat_fields_view'
import { PetSpeciesDogFieldsView } from 'features/form/pet/pet_species_dog_fields_view'
import { PetSpeciesFormFieldsView } from 'features/form/pet/pet_species_fields_view'
import {
  type Pet,
  type Species,
  type TagValuePath,
} from 'features/form/pet/types'
import {
  type ComponentType,
  useCallback,
  useMemo,
} from 'react'
import {
  PetFormPresenter,
} from './pet_form_presenter'

const presenter = new PetFormPresenter()

// TODO feels like we should be able to make much of this implementation generic
export function PetForm({
  value,
  onValueChange,
}: FormProps<Pet>) {
  const model = useMemo(function () {
    return presenter.createModel(value)
  }, [value])

  const onFieldValueChange = useCallback(
    function<Path extends ValuePathsOfPresenter<typeof presenter>> (
      path: Path,
      value: ToValueOfPresenterValuePath<typeof presenter, Path>,
    ) {
      presenter.clearFieldError(model, path)
      presenter.setFieldValue<Path>(model, path, value)
    },
    [model],
  )

  const onFieldSubmit = useCallback(
    function<Path extends ValuePathsOfPresenter<typeof presenter>> (valuePath: Path) {
      const typePath = presenter.typePath(valuePath)
      if (presenter.validateField(model, valuePath)) {
        if (typePath === '$.newTag' && model.fields['$.newTag'].value.trim().length > 0) {
          // get the entered value, should already be validated
          const newValue = model.fields['$.newTag'].value
          presenter.addListItem(model, '$.tags', [newValue])
          presenter.clearFieldValue(model, '$.newTag')
        } else {
          // if it successfully validates
          // TODO move to next field
          // eslint-disable-next-line no-console
          console.log('move to next')
        }
      }
      return false
    },
    [model],
  )

  const onFieldBlur = useCallback(
    function<Path extends ValuePathsOfPresenter<typeof presenter>> (path: Path) {
      // work around potential loss of focus prior to state potentially invalidating change triggering
      // (e.g. changing a discriminator)
      // TODO debounce?
      setTimeout(function () {
        if (presenter.isValuePathActive(model, path)) {
          presenter.validateField(model, path)
        }
      }, 100)
    },
    [model],
  )

  const onSubmit = useCallback(
    function () {
      if (presenter.validateAll(model)) {
        onValueChange(model.value)
      }
    },
    [
      model,
      onValueChange,
    ],
  )

  const onRemoveTag = useCallback(
    function (valuePath: TagValuePath) {
      presenter.removeTag(model, valuePath)
    },
    [model],
  )

  const SpeciesCatComponent = usePartialObserverComponent(
    function () {
      return {
        fields: model.fields,
        onFieldValueChange,
        onFieldSubmit,
        onFieldBlur,
      }
    },
    [
      model,
      onFieldValueChange,
      onFieldSubmit,
      onFieldBlur,
    ],
    PetSpeciesCatFieldsView,
  )

  const SpeciesDogComponent = usePartialObserverComponent(
    function () {
      return {
        fields: model.fields,
        onFieldValueChange,
        onFieldSubmit,
        onFieldBlur,
      }
    },
    [
      model,
      onFieldValueChange,
      onFieldSubmit,
      onFieldBlur,
    ],
    PetSpeciesDogFieldsView,
  )

  const speciesComponents = useMemo<Record<Species, ComponentType>>(function () {
    return {
      cat: SpeciesCatComponent,
      dog: SpeciesDogComponent,
    }
  }, [
    SpeciesCatComponent,
    SpeciesDogComponent,
  ])

  const SpeciesComponent = usePartialObserverComponent(
    function () {
      return {
        fields: model.fields,
        onFieldValueChange,
        onFieldSubmit,
        onFieldBlur,
        speciesComponents,
      }
    },
    [
      model,
      onFieldValueChange,
      onFieldSubmit,
      onFieldBlur,
      speciesComponents,
    ],
    PetSpeciesFormFieldsView,
  )

  const PetForm = usePartialObserverComponent(
    function () {
      return {
        fields: model.fields,
        onFieldValueChange,
        onSubmit,
        onFieldSubmit,
        onFieldBlur,
        onRemoveTag,
        SpeciesComponent,
      }
    },
    [
      model,
      onFieldValueChange,
      onSubmit,
      onFieldSubmit,
      onFieldBlur,
      onRemoveTag,
      SpeciesComponent,
    ],
    PetFormImpl,
  )

  return <PetForm />
}

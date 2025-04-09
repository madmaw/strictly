import {
  type FormProps,
  useDefaultMobxFormHooks,
  usePartialObserverComponent,
  type ValuePathsOfPresenter,
} from '@strictly/react-form'
import { emulateTab } from 'emulate-tab'
import { PetFieldsView as PetFieldsViewImpl } from 'features/form/pet/pet_fields_view'
import { PetSpeciesCatFieldsView } from 'features/form/pet/pet_species_cat_fields_view'
import { PetSpeciesDogFieldsView } from 'features/form/pet/pet_species_dog_fields_view'
import { PetSpeciesFormFieldsView } from 'features/form/pet/pet_species_fields_view'
import {
  type Pet,
  type PetValuePaths,
  type Species,
  type TagValuePath,
} from 'features/form/pet/types'
import {
  type ComponentType,
  useCallback,
  useMemo,
} from 'react'
import {
  type PetFormModel,
  PetFormPresenter,
} from './pet_form_presenter'

const presenter = new PetFormPresenter()

export function PetForm({
  value,
  onValueChange,
}: FormProps<Pet>) {
  const onValidFieldSubmit = useCallback(
    function<Path extends ValuePathsOfPresenter<typeof presenter>> (model: PetFormModel, valuePath: Path) {
      const typePath = presenter.typePath(valuePath)
      if (typePath === '$.newTag' && model.fields['$.newTag'].value.trim().length > 0) {
        // get the validated value
        const newValue = model.fields['$.newTag'].value
        presenter.addListItem(model, '$.tags', [newValue])
        presenter.clearFieldValue(model, '$.newTag')
      } else {
        emulateTab()
      }
    },
    [],
  )

  const onValidFormSubmit = useCallback(
    function (_model: PetFormModel, value: Pet) {
      onValueChange(value)
    },
    [onValueChange],
  )

  const {
    model,
    onFieldValueChange,
    onFieldBlur,
    onFieldFocus,
    onFieldSubmit,
    onFormSubmit,
  } = useDefaultMobxFormHooks(presenter, value, {
    onValidFieldSubmit,
    onValidFormSubmit,
  })

  const onClearField = useCallback(
    function (valuePath: keyof PetValuePaths) {
      presenter.clearFieldValue(model, valuePath)
      presenter.clearFieldError(model, valuePath)
    },
    [model],
  )

  const onRemoveTag = useCallback(
    function (valuePath: TagValuePath) {
      presenter.removeTag(model, valuePath)
    },
    [model],
  )

  // TODO move to fieldsView instead of DI!
  // NOTE it will require the value/type paths for discriminated unions to be of the form
  // union:discriminator.field instead of union.discriminator:field (or maybe discriminator:union.field), which
  // I think has previously caused recursion issues, but might be solvable if it all gets fixed instead of only
  // partly is done
  const SpeciesCatComponent = usePartialObserverComponent(
    function () {
      return {
        fields: model.fields,
        onFieldValueChange,
        onFieldSubmit,
        onFieldFocus,
        onFieldBlur,
      }
    },
    [
      model,
      onFieldValueChange,
      onFieldSubmit,
      onFieldFocus,
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
        onFieldFocus,
        onFieldBlur,
      }
    },
    [
      model,
      onFieldValueChange,
      onFieldSubmit,
      onFieldFocus,
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
        onFieldFocus,
        onFieldBlur,
        speciesComponents,
      }
    },
    [
      model,
      onFieldValueChange,
      onFieldSubmit,
      onFieldFocus,
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
        onSubmit: onFormSubmit,
        onFieldSubmit,
        onFieldFocus,
        onFieldBlur,
        onRemoveTag,
        onClearField,
        SpeciesComponent,
      }
    },
    [
      model,
      onFieldValueChange,
      onFormSubmit,
      onFieldSubmit,
      onFieldFocus,
      onFieldBlur,
      onRemoveTag,
      onClearField,
      SpeciesComponent,
    ],
    PetFieldsViewImpl,
  )

  return <PetForm />
}

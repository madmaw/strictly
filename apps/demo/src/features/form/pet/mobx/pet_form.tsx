import {
  type FormMode,
  type FormProps,
  useDefaultMobxFormHooks,
  usePartialObserverComponent,
  type ValuePathsOfModel,
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
  PetFormModel,
} from './pet_form_model'

export function PetForm({
  value,
  onValueChange,
  mode,
}: FormProps<Pet> & {
  mode: FormMode,
}) {
  const model = useMemo(() => {
    return new PetFormModel(value, mode)
  }, [
    value,
    mode,
  ])

  const onValidFieldSubmit = useCallback(
    function<Path extends ValuePathsOfModel<PetFormModel>> (valuePath: Path) {
      const typePath = model.typePath(valuePath)
      if (typePath === '$.newTag' && model.fields['$.newTag'].value.trim().length > 0) {
        // get the validated value
        const newValue = model.fields['$.newTag'].value
        model.addListItem('$.tags', [newValue])
        model.clearFieldValue('$.newTag')
      } else {
        emulateTab()
      }
    },
    [model],
  )

  const onValidFormSubmit = useCallback(
    function (value: Pet) {
      onValueChange(value)
    },
    [onValueChange],
  )

  const onForceValidate = useCallback(() => {
    model.validateAll(true)
  }, [model])

  const {
    onFieldValueChange,
    onFieldBlur,
    onFieldFocus,
    onFieldSubmit,
    onFormSubmit,
  } = useDefaultMobxFormHooks(model, {
    onValidFieldSubmit,
    onValidFormSubmit,
  })

  const onClearField = useCallback(
    function (valuePath: keyof PetValuePaths) {
      model.clearFieldValue(valuePath)
      model.clearFieldError(valuePath)
    },
    [model],
  )

  const onRemoveTag = useCallback(
    function (valuePath: TagValuePath) {
      model.removeTag(valuePath)
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
        SpeciesComponent,
        fields: model.fields,
        onClearField,
        onFieldBlur,
        onFieldFocus,
        onFieldSubmit,
        onFieldValueChange,
        onForceValidate,
        onRemoveTag,
        onSubmit: onFormSubmit,
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
      onForceValidate,
      SpeciesComponent,
    ],
    PetFieldsViewImpl,
  )

  return <PetForm />
}

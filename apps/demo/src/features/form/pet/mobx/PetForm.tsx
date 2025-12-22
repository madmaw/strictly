import {
  type FormProps,
  useDefaultMobxFormHooks,
  usePartialObserverComponent,
  Validation,
} from '@strictly/react-form'
import { emulateTab } from 'emulate-tab'
import { type PetValuePaths } from 'features/form/pet/fields'
import { PetFieldsView } from 'features/form/pet/PetFieldsView'
import { PetSpeciesCatFieldsView } from 'features/form/pet/PetSpeciesCatFieldsView'
import { PetSpeciesDogFieldsView } from 'features/form/pet/PetSpeciesDogFieldsView'
import { PetSpeciesFormFieldsView } from 'features/form/pet/PetSpeciesFieldsView'
import {
  type Pet,
  type Species,
  type TagValuePath,
} from 'features/form/pet/types'
import { Observer } from 'mobx-react'
import {
  type ComponentType,
  useCallback,
  useMemo,
} from 'react'
import {
  PetFormModel,
} from './PetFormModel'

export function PetForm({
  value,
  onValueChange,
  forceMutable,
}: FormProps<Pet> & {
  forceMutable: boolean,
}) {
  const model = useMemo(() => {
    return new PetFormModel(value, forceMutable)
  }, [
    value,
    forceMutable,
  ])

  const firstInputRef = useCallback((input: HTMLInputElement | null) => {
    input?.focus()
  }, [])

  const onValidFieldSubmit = useCallback(
    function<Path extends keyof PetFormModel['fields']> (valuePath: Path) {
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
    model.validateAll(Validation.Always)
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
    function (valuePath: PetValuePaths) {
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

  return (
    <Observer>
      {() => (
        <PetFieldsView
          SpeciesComponent={SpeciesComponent}
          fields={model.fields}
          firstInputRef={firstInputRef}
          onClearField={onClearField}
          onFieldBlur={onFieldBlur}
          onFieldFocus={onFieldFocus}
          onFieldSubmit={onFieldSubmit}
          onFieldValueChange={onFieldValueChange}
          onForceValidate={onForceValidate}
          onRemoveTag={onRemoveTag}
          onSubmit={onFormSubmit}
          submitDisabled={model.submitDisabled}
        />
      )}
    </Observer>
  )
}

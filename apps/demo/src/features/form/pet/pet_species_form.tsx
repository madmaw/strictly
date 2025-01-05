import { t } from '@lingui/core/macro'
import {
  Group,
  Stack,
} from '@mantine/core'
import { toArray } from '@strictly/base'
import {
  type FormProps,
  useMantineForm,
} from '@strictly/react-form'
import { type ComponentType } from 'react'
import { type PetFields } from './fields'
import {
  type Species,
} from './types'

export function SpeciesLabel() {
  return t({
    message: 'Species',
    comment: 'label for species field',
  })
}

export type PetSpeciesFormFields = Pick<
  PetFields,
  '$.species'
>

export type PetSpeciesFormProps = FormProps<PetSpeciesFormFields> & {
  speciesComponents: Record<Species, ComponentType>,
}

const SPECIES_NAMES: Record<Species, () => string> = {
  cat: () =>
    t({
      message: 'Cat',
      comment: 'The name of the animal cat',
    }),
  dog: () =>
    t({
      message: 'Dog',
      comment: 'The name of the animal dog',
    }),
}

export function PetSpeciesForm(props: PetSpeciesFormProps) {
  const {
    speciesComponents,
    fields,
  } = props
  const form = useMantineForm(props)
  const SpeciesRadioGroup = form.radioGroup('$.species')
  const speciesValue = fields['$.species'].value
  const SpeciesComponent = speciesValue && speciesComponents[speciesValue]
  return (
    <Stack>
      <SpeciesRadioGroup label={SpeciesLabel()}>
        <Group>
          {toArray(
            SPECIES_NAMES,
          ).map(
            function ([
              value,
              displayName,
            ]) {
              const SpeciesRadio = form.radio('$.species', value)
              return (
                <SpeciesRadio
                  key={value}
                  label={displayName()}
                />
              )
            },
          )}
        </Group>
      </SpeciesRadioGroup>
      {SpeciesComponent && <SpeciesComponent />}
    </Stack>
  )
}

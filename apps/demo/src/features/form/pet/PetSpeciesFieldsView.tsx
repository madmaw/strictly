import { t } from '@lingui/core/macro'
import {
  Group,
  Stack,
} from '@mantine/core'
import { toArray } from '@strictly/base'
import {
  type FieldsViewProps,
  useMantineFormFields,
} from '@strictly/react-form'
import { type ComponentType } from 'react'
import { type PetFields } from './Fields'
import {
  type Species,
} from './Types'

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

export type PetSpeciesFieldsViewProps = FieldsViewProps<PetSpeciesFormFields> & {
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

export function PetSpeciesFormFieldsView(props: PetSpeciesFieldsViewProps) {
  const {
    speciesComponents,
    fields,
  } = props
  const form = useMantineFormFields(props)
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

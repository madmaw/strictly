import {
  Group,
  Stack,
} from '@mantine/core'
import { toArray } from '@strictly/base'
import {
  type Field,
  type FlattenedFormFieldsOf,
  type FormProps,
  useMantineForm,
} from '@strictly/react-form'
import { type ComponentType } from 'react'
import {
  type PetValueToTypePaths,
  type Species,
} from './types'

export type PetSpeciesFormFields = FlattenedFormFieldsOf<
  PetValueToTypePaths,
  {
    '$.species': Field<Species, never>,
  }
>

export type PetSpeciesFormProps = FormProps<PetSpeciesFormFields> & {
  speciesComponents: Record<Species, ComponentType>,
}

const SPECIES_NAMES: Record<Species, string> = {
  cat: 'Cat',
  dog: 'Dog',
}

export function PetSpeciesForm(props: PetSpeciesFormProps) {
  const {
    speciesComponents,
    fields,
  } = props
  const form = useMantineForm(props)
  const SpeciesRadioGroup = form.radioGroup('$.species')
  const speciesValue = fields['$.species'].value
  const SpeciesComponent = speciesComponents[speciesValue]
  return (
    <Stack>
      <SpeciesRadioGroup label='Species'>
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
                  label={displayName}
                />
              )
            },
          )}
        </Group>
      </SpeciesRadioGroup>
      <SpeciesComponent />
    </Stack>
  )
}

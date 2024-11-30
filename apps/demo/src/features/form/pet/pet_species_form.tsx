import { toArray } from '@de/base'
import {
  type Field,
  type FlattenedFormFieldsOf,
  type FormProps,
  useFormRadioGroup,
} from '@de/form-react'
import {
  Group,
  Radio,
  Stack,
} from '@mantine/core'
import { type ComponentType } from 'react'
import {
  type FlattenedPetJsonValueToTypePaths,
  type Species,
} from './types'

export type PetSpeciesFormFields = FlattenedFormFieldsOf<
  FlattenedPetJsonValueToTypePaths,
  {
    '$.species': Field<never, Species>,
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
  const species = useFormRadioGroup('$.species', props)
  const speciesValue = fields['$.species'].value
  const SpeciesComponent = speciesComponents[speciesValue]
  return (
    <Stack>
      <Radio.Group
        {...species}
        label='Species'
      >
        <Group>
          {toArray(
            SPECIES_NAMES,
          ).map(
            function ([
              value,
              displayName,
            ]) {
              return (
                <Radio
                  disabled={species.disabled}
                  key={value}
                  label={displayName}
                  value={value}
                />
              )
            },
          )}
        </Group>
      </Radio.Group>
      <SpeciesComponent />
    </Stack>
  )
}

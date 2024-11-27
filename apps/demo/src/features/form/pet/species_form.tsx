import { toArray } from '@de/base'
import {
  type FlattenedFormFieldsOf,
  type FormField,
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

export type SpeciesFormFields = FlattenedFormFieldsOf<
  FlattenedPetJsonValueToTypePaths,
  {
    '$.species': FormField<never, Species>,
    // '$.species.dog:barks': FormField<typeof NOT_A_NUMBER_ERROR, string>,
    // '$.species.cat:meows': FormField<typeof NOT_A_NUMBER_ERROR, string>,
  }
>

export type SpeciesFormProps = FormProps<SpeciesFormFields> & {
  speciesComponents: Record<Species, ComponentType>,
}

const SPECIES_NAMES: Record<Species, string> = {
  cat: 'Cat',
  dog: 'Dog',
}

export function SpeciesForm(props: SpeciesFormProps) {
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
                  key={value}
                  label={displayName}
                  value={value}
                />
              )
            },
          )}
        </Group>
        <SpeciesComponent />
      </Radio.Group>
    </Stack>
  )
}

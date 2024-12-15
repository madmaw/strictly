import {
  type Field,
  type FlattenedFormFieldsOf,
  type FormProps,
} from '@de/form-react'
import { useMantineForm } from '@de/form-react/mantine/hooks'
import {
  Slider,
  Stack,
} from '@mantine/core'
import {
  type PetValueToTypePaths,
} from './types'

export type PetSpeciesCatFormFields = FlattenedFormFieldsOf<
  PetValueToTypePaths,
  {
    '$.species.cat:meows': Field<number, never>,
  }
>

export type PetSpeciesFormCatProps = FormProps<PetSpeciesCatFormFields>

export function PetSpeciesCatForm(props: PetSpeciesFormCatProps) {
  const form = useMantineForm(props)
  const MeowsSlider = form.valueInput('$.species.cat:meows', Slider)
  return (
    <Stack px='sm'>
      <MeowsSlider
        label='Meows'
        marks={[
          {
            label: 'Quiet',
            value: 0,
          },
          {
            label: 'Normal',
            value: 5,
          },
          {
            label: 'Noisy',
            value: 10,
          },
        ]}
        max={10}
        min={0}
        pb='xl'
      />
    </Stack>
  )
}

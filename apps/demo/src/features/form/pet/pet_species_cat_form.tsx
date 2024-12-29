import {
  Slider,
  Stack,
} from '@mantine/core'
import {
  type Field,
  type FlattenedFormFieldsOf,
  type FormProps,
  useMantineForm,
} from '@strictly/react-form'
import {
  type NOT_A_BREED_ERROR,
  type PetValueToTypePaths,
} from './types'

export type PetSpeciesCatFormFields = FlattenedFormFieldsOf<
  PetValueToTypePaths,
  {
    '$.species.cat:meows': Field<number, never>,
    '$.species.cat:breed': Field<string | null, typeof NOT_A_BREED_ERROR>,
  }
>

export type PetSpeciesFormCatProps = FormProps<PetSpeciesCatFormFields>

export function PetSpeciesCatForm(props: PetSpeciesFormCatProps) {
  const form = useMantineForm(props)
  const MeowsSlider = form.valueInput('$.species.cat:meows', Slider)
  const BreedSelect = form.select('$.species.cat:breed')
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
      <BreedSelect data={[
        'Burmese',
        'Siamese',
        'Domestic Short Hair',
      ]} />
    </Stack>
  )
}

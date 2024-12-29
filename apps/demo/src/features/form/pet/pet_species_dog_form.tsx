import {
  NumberInput,
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
  type NOT_A_NUMBER_ERROR,
  type PetValueToTypePaths,
} from './types'

export type PetSpeciesDogFormFields = FlattenedFormFieldsOf<
  PetValueToTypePaths,
  {
    '$.species.dog:barks': Field<string | number, typeof NOT_A_NUMBER_ERROR>,
    '$.species.dog:breed': Field<string | null, typeof NOT_A_BREED_ERROR>,
  }
>

export type PetSpeciesFormDogProps = FormProps<PetSpeciesDogFormFields>

export function PetSpeciesDogForm(props: PetSpeciesFormDogProps) {
  const form = useMantineForm(props)
  const BarksNumberInput = form.valueInput(
    '$.species.dog:barks',
    NumberInput,
  )
  const BreedInput = form.select(
    '$.species.dog:breed',
  )

  return (
    <Stack>
      <BreedInput
        data={[
          'Alsatian',
          'Pug',
          'Other',
          'Burmese',
        ]}
        label='Breed'
      />
      <BarksNumberInput label='Barks' />
    </Stack>
  )
}

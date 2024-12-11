import {
  type Field,
  type FlattenedFormFieldsOf,
  type FormProps,
} from '@de/form-react'
import { useMantineForm } from '@de/form-react/mantine/hooks'
import {
  NumberInput,
  Stack,
} from '@mantine/core'
import {
  type FlattenedPetJsonValueToTypePaths,
  type NOT_A_NUMBER_ERROR,
} from './types'

export type PetSpeciesDogFormFields = FlattenedFormFieldsOf<
  FlattenedPetJsonValueToTypePaths,
  {
    '$.species.dog:barks': Field<typeof NOT_A_NUMBER_ERROR, string | number>,
    // TODO more fields
  }
>

export type PetSpeciesFormDogProps = FormProps<PetSpeciesDogFormFields>

export function PetSpeciesDogForm(props: PetSpeciesFormDogProps) {
  const form = useMantineForm(props)
  const BarksNumberInput = form.valueInput(
    '$.species.dog:barks',
    NumberInput,
  )
  return (
    <Stack>
      <BarksNumberInput label='Barks' />
    </Stack>
  )
}

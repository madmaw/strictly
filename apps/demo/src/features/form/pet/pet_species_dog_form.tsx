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
  type NOT_A_NUMBER_ERROR,
  type PetValueToTypePaths,
} from './types'

export type PetSpeciesDogFormFields = FlattenedFormFieldsOf<
  PetValueToTypePaths,
  {
    '$.species.dog:barks': Field<string | number, typeof NOT_A_NUMBER_ERROR>,
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

import {
  type Field,
  type FlattenedFormFieldsOf,
  type FormProps,
} from '@de/form-react'
import { useMantineForm } from '@de/form-react/mantine/hooks'
import {
  Stack,
} from '@mantine/core'
import {
  type FlattenedPetJsonValueToTypePaths,
  type NOT_A_NUMBER_ERROR,
} from './types'

export type PetSpeciesDogFormFields = FlattenedFormFieldsOf<
  FlattenedPetJsonValueToTypePaths,
  {
    '$.species.dog:barks': Field<typeof NOT_A_NUMBER_ERROR, string>,
  }
>

export type PetSpeciesFormDogProps = FormProps<PetSpeciesDogFormFields>

export function PetSpeciesDogForm(props: PetSpeciesFormDogProps) {
  const form = useMantineForm(props)
  const BarksTextInput = form.textInputComponent('$.species.dog:barks')
  return (
    <Stack>
      <BarksTextInput
        label='Barks'
        type='number'
      />
    </Stack>
  )
}

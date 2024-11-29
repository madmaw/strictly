import {
  type Field,
  type FlattenedFormFieldsOf,
  type FormProps,
  useFormInput,
} from '@de/form-react'
import {
  Stack,
  TextInput,
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
  const meows = useFormInput('$.species.dog:barks', props)
  return (
    <Stack>
      <TextInput
        {...meows}
        label='Barks'
        type='number'
      />
    </Stack>
  )
}

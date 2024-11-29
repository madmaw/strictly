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

export type PetSpeciesCatFormFields = FlattenedFormFieldsOf<
  FlattenedPetJsonValueToTypePaths,
  {
    '$.species.cat:meows': Field<typeof NOT_A_NUMBER_ERROR, string>,
  }
>

export type PetSpeciesFormCatProps = FormProps<PetSpeciesCatFormFields>

export function PetSpeciesCatForm(props: PetSpeciesFormCatProps) {
  const meows = useFormInput('$.species.cat:meows', props)
  return (
    <Stack>
      <TextInput
        {...meows}
        label='Meows'
        type='number'
      />
    </Stack>
  )
}

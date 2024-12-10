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

export type PetSpeciesCatFormFields = FlattenedFormFieldsOf<
  FlattenedPetJsonValueToTypePaths,
  {
    '$.species.cat:meows': Field<typeof NOT_A_NUMBER_ERROR, string>,
  }
>

export type PetSpeciesFormCatProps = FormProps<PetSpeciesCatFormFields>

export function PetSpeciesCatForm(props: PetSpeciesFormCatProps) {
  const form = useMantineForm(props)
  const MeowsTextInput = form.textInput('$.species.cat:meows')
  return (
    <Stack>
      <MeowsTextInput
        label='Meows'
        type='number'
      />
    </Stack>
  )
}

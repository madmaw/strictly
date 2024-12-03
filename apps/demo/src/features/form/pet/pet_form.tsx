// TODO typescript plugin https://www.npmjs.com/package/typescript-plugin-css-modules#visual-studio-code
// TODO remove project references
import styles from './pet_form.module.css'

import {
  type Field,
  type FlattenedFormFieldsOf,
  type FormProps,
} from '@de/form-react'
import { useMantineForm } from '@de/form-react/mantine/hooks'
import {
  Button,
  Card,
  Stack,
} from '@mantine/core'
import { type ComponentType } from 'react'
import {
  type FlattenedPetJsonValueToTypePaths,
  type NAME_TOO_SHORT_ERROR,
} from './types'

export const LABEL_SUBMIT = 'Submit'

export type PetFormFields = FlattenedFormFieldsOf<
  FlattenedPetJsonValueToTypePaths,
  {
    '$.name': Field<typeof NAME_TOO_SHORT_ERROR, string>,
    '$.alive': Field<never, boolean>,
  }
>

export type PetFormProps = FormProps<PetFormFields> & {
  SpeciesComponent: ComponentType,
  onSubmit: () => void,
}

export function PetForm(props: PetFormProps) {
  const {
    onSubmit,
    SpeciesComponent,
  } = props
  const form = useMantineForm(props)
  const NameTextInput = form.textInputComponent('$.name')
  const AliveCheckbox = form.checkboxComponent('$.alive')

  return (
    <Stack>
      <NameTextInput label='Name' />
      <AliveCheckbox label='Alive' />
      <Card withBorder={true}>
        <SpeciesComponent />
      </Card>
      <Button
        className={styles.hot}
        onClick={onSubmit}
      >
        {LABEL_SUBMIT}
      </Button>
    </Stack>
  )
}

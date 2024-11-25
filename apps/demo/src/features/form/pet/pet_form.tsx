import {
  type FormProps,
  useFormCheckBox,
  useFormInput,
} from '@de/form-react'
import {
  Button,
  Checkbox,
  Stack,
  TextInput,
} from '@mantine/core'
import { type PetFormFields } from './types'

export const LABEL_SUBMIT = 'Submit'

export type PetFormProps = FormProps<PetFormFields> & {
  onSubmit: () => void,
}

export function PetForm(props: PetFormProps) {
  const { onSubmit } = props
  const name = useFormInput('$.name', props)
  const alive = useFormCheckBox('$.alive', props)
  return (
    <Stack>
      <TextInput
        {...name}
        label='Name'
      />
      <Checkbox
        {...alive}
        label='Alive'
      />
      <Button onClick={onSubmit}>
        {LABEL_SUBMIT}
      </Button>
    </Stack>
  )
}

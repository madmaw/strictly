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
import { type PetFields } from './types'

type PetFormProps = FormProps<PetFields> & {
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
        Submit
      </Button>
    </Stack>
  )
}

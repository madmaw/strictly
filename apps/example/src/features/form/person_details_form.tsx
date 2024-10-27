import {
  Button,
  Stack,
  TextInput,
} from '@mantine/core'
import {
  type FormProps,
  useFormInput,
} from '@tscriptors/form'
import { type PersonDetailsFields } from './types'

type PersonDetailsFormProps = FormProps<PersonDetailsFields> & {
  onSubmit: () => void,
}

export function PersonDetailsForm(props: PersonDetailsFormProps) {
  const { onSubmit } = props
  const firstName = useFormInput('$.firstName', props)
  const middleName = useFormInput('$.middleName', props)
  const lastName = useFormInput('$.lastName', props)
  return (
    <Stack>
      <TextInput
        {...firstName}
        label='First Name'
      />
      <TextInput
        {...middleName}
        label='Middle Name'
      />
      <TextInput
        {...lastName}
        label='Last Name'
      />
      <Button onClick={onSubmit}>
        Submit
      </Button>
    </Stack>
  )
}

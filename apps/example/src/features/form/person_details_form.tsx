import {
  type FormProps,
  useFormInput,
} from '@tscriptors/form'
import { type PersonDetailsFields } from './types'

type PersonDetailsFormProps = FormProps<PersonDetailsFields>

export function PersonDetailsForm(props: PersonDetailsFormProps) {
  const firstName = useFormInput('$.firstName', props)
  return (
    <div>
      {firstName.value}
    </div>
  )
}

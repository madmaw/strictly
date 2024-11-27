import {
  type FlattenedFormFieldsOf,
  type FormField,
  type FormProps,
  useFormCheckBox,
  useFormInput,
} from '@de/form-react'
import {
  Button,
  Card,
  Checkbox,
  Stack,
  TextInput,
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
    '$.name': FormField<typeof NAME_TOO_SHORT_ERROR, string>,
    '$.alive': FormField<never, boolean>,
    // '$.species': FormField<never, Species>,
    // '$.species.dog:barks': FormField<typeof NOT_A_NUMBER_ERROR, string>,
    // '$.species.cat:meows': FormField<typeof NOT_A_NUMBER_ERROR, string>,
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
      <Card withBorder={true}>
        <SpeciesComponent />
      </Card>
      <Button onClick={onSubmit}>
        {LABEL_SUBMIT}
      </Button>
    </Stack>
  )
}

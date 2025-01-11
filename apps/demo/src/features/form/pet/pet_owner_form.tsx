import { t } from '@lingui/core/macro'
import {
  Group,
  Stack,
} from '@mantine/core'
import {
  type FormProps,
  useMantineForm,
} from '@strictly/react-form'
import { type PetFields } from './fields'

export type PetOwnerFormFields = Pick<
  PetFields,
  '$.owner.email' | '$.owner.firstName' | '$.owner.surname' | '$.owner.phoneNumber'
>

export function FirstNameLabel() {
  return t({
    message: 'First Name',
    comment: 'Text input for first name',
  })
}

export function SurnameLabel() {
  return t({
    message: 'Surname',
    comment: 'Text input for second name',
  })
}

export function PhoneNumberLabel() {
  return t({
    message: 'Phone number',
    comment: 'Text input for contact phone number',
  })
}

export function PhoneNumberPlaceholder() {
  return t({
    message: '04xxxxxxxx',
    comment: 'Placeholder for the contact phone number',
  })
}

export function EmailLabel() {
  return t({
    message: 'Email',
    comment: 'Text input for email address',
  })
}

export function EmailPlaceholder() {
  return t({
    message: 'me@somewhere.org',
    comment: 'Placeholder for the email address text input',
  })
}

export type PetOwnerFormProps = FormProps<PetOwnerFormFields>

export function PetOwnerForm(props: PetOwnerFormProps) {
  const form = useMantineForm(props)
  const FirstNameInput = form.textInput('$.owner.firstName')
  const SurnameInput = form.textInput('$.owner.surname')
  const EmailInput = form.textInput('$.owner.email')
  const PhoneNumberInput = form.textInput('$.owner.phoneNumber')

  return (
    <Stack>
      <Group
        grow={true}
        preventGrowOverflow={true}
      >
        <FirstNameInput
          autoCapitalize='words'
          label={FirstNameLabel()}
          type='text'
        />
        <SurnameInput
          autoCapitalize='words'
          label={SurnameLabel()}
          type='text'
        />
      </Group>
      <PhoneNumberInput
        label={PhoneNumberLabel()}
        placeholder={PhoneNumberPlaceholder()}
        type='tel'
      />
      <EmailInput
        label={EmailLabel()}
        placeholder={EmailPlaceholder()}
        type='email'
      />
    </Stack>
  )
}

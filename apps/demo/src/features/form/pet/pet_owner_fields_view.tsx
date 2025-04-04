import { t } from '@lingui/core/macro'
import {
  Group,
  Stack,
} from '@mantine/core'
import { type Reverse } from '@strictly/base'
import {
  type FlattenedTypesOfType,
  type FlattenedValuesOfType,
  object,
  type PathsOfType,
  type ReadonlyTypeOfType,
  stringType,
  type ValueOfType,
  type ValueToTypePathsOfType,
} from '@strictly/define'
import {
  type FieldAdaptersOfValues,
  type FieldsViewProps,
  type FormFieldsOfFieldAdapters,
  identityAdapter,
  useMantineFormFields,
} from '@strictly/react-form'

export const petOwnerType = object()
  .field('firstName', stringType.required())
  .field('surname', stringType.required())
  .field('phoneNumber', stringType.required())
  .optionalField('email', stringType)
  .narrow

export type PetOwner = ValueOfType<typeof petOwnerType>
export type PetOwnerValuePaths = PathsOfType<typeof petOwnerType>
export type PetOwnerTypePaths = PathsOfType<typeof petOwnerType, '*'>
export type FlattenedPetOwnerTypes = FlattenedTypesOfType<typeof petOwnerType, '*'>
export type PetOwnerValueToTypePaths = ValueToTypePathsOfType<typeof petOwnerType>
export type PetOwnerTypeToValuePaths = Reverse<PetOwnerValueToTypePaths>

export const unvalidatedPetOwnerFieldAdapters = {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  '$.email': identityAdapter('' as string | undefined).narrow,
  '$.firstName': identityAdapter('').narrow,
  '$.phoneNumber': identityAdapter('').narrow,
  '$.surname': identityAdapter('').narrow,
} as const satisfies Partial<
  FieldAdaptersOfValues<
    FlattenedValuesOfType<ReadonlyTypeOfType<typeof petOwnerType>, '*'>,
    PetOwnerTypeToValuePaths,
    PetOwner
  >
>

export type PetOwnerFields = FormFieldsOfFieldAdapters<
  PetOwnerValueToTypePaths,
  typeof unvalidatedPetOwnerFieldAdapters
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

export type PetOwnerFieldsViewProps = FieldsViewProps<PetOwnerFields>

export function PetOwnerFieldsView(props: PetOwnerFieldsViewProps) {
  const form = useMantineFormFields(props)
  const FirstNameInput = form.textInput('$.firstName')
  const SurnameInput = form.textInput('$.surname')
  const EmailInput = form.textInput('$.email')
  const PhoneNumberInput = form.textInput('$.phoneNumber')

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

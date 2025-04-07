import { t } from '@lingui/core/macro'
import {
  Group,
  Stack,
} from '@mantine/core'
import {
  type Reverse,
  UnreachableError,
} from '@strictly/base'
import {
  type FlattenedTypesOfType,
  type FlattenedValuesOfType,
  flattenValidatorsOfValidatingType,
  MinimumStringLengthValidationErrorType,
  MinimumStringLengthValidator,
  object,
  type PathsOfType,
  type ReadonlyTypeOfType,
  stringType,
  type ValueOfType,
  type ValueToTypePathsOfType,
} from '@strictly/define'
import {
  type ErrorOfField,
  type ErrorRendererProps,
  type FieldAdaptersOfValues,
  type FieldsViewProps,
  type FormFieldsOfFieldAdapters,
  identityAdapter,
  mergeAdaptersWithValidators,
  useMantineFormFields,
} from '@strictly/react-form'

const minimumNameLengthValidator = new MinimumStringLengthValidator(3)

export const petOwnerType = object()
  .field('firstName', stringType.enforce(minimumNameLengthValidator))
  .field('surname', stringType.enforce(minimumNameLengthValidator))
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
  '$.email': identityAdapter<string | undefined, '$.email', PetOwner>('').narrow,
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

const petOwnerValidators = flattenValidatorsOfValidatingType<typeof petOwnerType, PetOwnerTypeToValuePaths>(
  petOwnerType,
)

export const petOwnerFieldAdapters = mergeAdaptersWithValidators(
  unvalidatedPetOwnerFieldAdapters,
  petOwnerValidators,
)

export type PetOwnerFields = FormFieldsOfFieldAdapters<
  PetOwnerValueToTypePaths,
  typeof petOwnerFieldAdapters
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

function FirstNameInputErrorRenderer({ error }: ErrorRendererProps<ErrorOfField<PetOwnerFields['$.firstName']>>) {
  switch (error.type) {
    case MinimumStringLengthValidationErrorType:
      return t({
        message: `First name must be at least ${error.minimumLength} characters long`,
        comment: 'error that is displayed when the first name input is too short',
      })
    default:
      throw new UnreachableError(error.type)
  }
}

function SurnameInputErrorRenderer({ error }: ErrorRendererProps<ErrorOfField<PetOwnerFields['$.firstName']>>) {
  switch (error.type) {
    case MinimumStringLengthValidationErrorType:
      return t({
        message: `Surname must be at least ${error.minimumLength} characters long`,
        comment: 'error that is displayed when the last name input is too short',
      })
    default:
      throw new UnreachableError(error.type)
  }
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
        align='start'
        grow={true}
        preventGrowOverflow={true}
      >
        <FirstNameInput
          ErrorRenderer={FirstNameInputErrorRenderer}
          autoCapitalize='words'
          label={FirstNameLabel()}
          type='text'
        />
        <SurnameInput
          ErrorRenderer={SurnameInputErrorRenderer}
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

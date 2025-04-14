import { t } from '@lingui/core/macro'
import {
  CloseButton,
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
  OptionalValidatorProxy,
  type PathsOfType,
  type ReadonlyTypeOfType,
  RegexpValidationErrorType,
  RegexpValidator,
  stringType,
  type ValueOfType,
  type ValueToTypePathsOfType,
} from '@strictly/define'
import {
  type ErrorRendererProps,
  type FieldAdaptersOfValues,
  type FieldsViewProps,
  type FormFieldsOfFieldAdapters,
  mergeAdaptersWithValidators,
  trimmingStringAdapter,
  useMantineFormFields,
} from '@strictly/react-form'
import { useCallback } from 'react'

const minimumNameLengthValidator = new MinimumStringLengthValidator(3)

export const petOwnerType = object()
  .field('firstName', stringType.enforce(minimumNameLengthValidator))
  .field('surname', stringType.enforce(minimumNameLengthValidator))
  .field('phoneNumber', stringType.required().enforce(RegexpValidator.phone))
  .optionalField('email', stringType.enforce(OptionalValidatorProxy.createNullableOrEmptyString(RegexpValidator.email)))
  .narrow

export type PetOwner = ValueOfType<typeof petOwnerType>
export type PetOwnerValuePaths = PathsOfType<typeof petOwnerType>
export type PetOwnerTypePaths = PathsOfType<typeof petOwnerType, '*'>
export type FlattenedPetOwnerTypes = FlattenedTypesOfType<typeof petOwnerType, '*'>
export type PetOwnerValueToTypePaths = ValueToTypePathsOfType<typeof petOwnerType>
export type PetOwnerTypeToValuePaths = Reverse<PetOwnerValueToTypePaths>

export const unvalidatedPetOwnerFieldAdapters = {
  '$.email': trimmingStringAdapter().optional().narrow,
  '$.firstName': trimmingStringAdapter().narrow,
  '$.phoneNumber': trimmingStringAdapter().narrow,
  '$.surname': trimmingStringAdapter().narrow,
} as const satisfies Partial<
  FieldAdaptersOfValues<
    FlattenedValuesOfType<ReadonlyTypeOfType<typeof petOwnerType>, '*'>,
    PetOwnerTypeToValuePaths,
    {}
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

function FirstNameInputErrorRenderer({ error }: ErrorRendererProps<PetOwnerFields, '$.firstName'>) {
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

function SurnameInputErrorRenderer({ error }: ErrorRendererProps<PetOwnerFields, '$.firstName'>) {
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

function PhoneNumberErrorRenderer({ error }: ErrorRendererProps<PetOwnerFields, '$.phoneNumber'>) {
  switch (error.type) {
    case RegexpValidationErrorType:
      return t({
        message: 'Must be a valid phone number',
        comment: 'error shown when the user puts in a weird phone number',
      })
    default:
      throw new UnreachableError(error.type)
  }
}

function EmailErrorRenderer({ error }: ErrorRendererProps<PetOwnerFields, '$.email'>) {
  switch (error.type) {
    case RegexpValidationErrorType:
      return t({
        message: 'Must be a valid email',
        comment: 'error shown when the user puts in a weird email address',
      })
    default:
      throw new UnreachableError(error.type)
  }
}

export type PetOwnerFieldsViewProps = FieldsViewProps<PetOwnerFields> & {
  clearField: (valuePath: PetOwnerValuePaths) => void,
}

export function PetOwnerFieldsView({
  clearField,
  ...props
}: PetOwnerFieldsViewProps) {
  const form = useMantineFormFields(props)
  const FirstNameInput = form.textInput('$.firstName')
  const SurnameInput = form.textInput('$.surname')
  const EmailInput = form.textInput('$.email')
  const PhoneNumberInput = form.textInput('$.phoneNumber')

  const onClearPhoneNumber = useCallback(() => {
    clearField('$.phoneNumber')
  }, [clearField])

  const ClearPhoneNumberButton = useCallback(() => {
    return <CloseButton onClick={onClearPhoneNumber} />
  }, [onClearPhoneNumber])

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
        ErrorRenderer={PhoneNumberErrorRenderer}
        label={PhoneNumberLabel()}
        placeholder={PhoneNumberPlaceholder()}
        rightSection={<ClearPhoneNumberButton />}
        type='tel'
      />
      <EmailInput
        ErrorRenderer={EmailErrorRenderer}
        label={EmailLabel()}
        placeholder={EmailPlaceholder()}
        type='email'
      />
    </Stack>
  )
}

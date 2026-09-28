import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { CloseButton, Group, Stack } from '@mantine/core'
import { type Reverse } from '@strictly/base'
import {
  type FlattenedTypesOfType,
  type FlattenedValuesOfType,
  flattenValidatorsOfValidatingType,
  MinimumStringLengthValidator,
  object,
  OptionalValidatorProxy,
  type ReadonlyTypeOfType,
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
  .optionalField(
    'email',
    stringType.enforce(OptionalValidatorProxy.createNullableOrEmptyString(RegexpValidator.email)),
  ).narrow

export type PetOwner = ValueOfType<typeof petOwnerType>
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

export const petOwnerFieldAdapters = mergeAdaptersWithValidators(unvalidatedPetOwnerFieldAdapters, petOwnerValidators)

export type PetOwnerTypePaths = keyof typeof petOwnerFieldAdapters
export type PetOwnerValuePaths = PetOwnerTypeToValuePaths[PetOwnerTypePaths]

export type PetOwnerFields = FormFieldsOfFieldAdapters<PetOwnerValueToTypePaths, typeof petOwnerFieldAdapters>

export function firstNameLabel() {
  return t({
    message: 'First Name',
    comment: 'Text input for first name',
  })
}

export function surnameLabel() {
  return t({
    message: 'Surname',
    comment: 'Text input for second name',
  })
}

export function phoneNumberLabel() {
  return t({
    message: 'Phone number',
    comment: 'Text input for contact phone number',
  })
}

export function phoneNumberPlaceholder() {
  return t({
    message: '04xxxxxxxx',
    comment: 'Placeholder for the contact phone number',
  })
}

export function emailLabel() {
  return t({
    message: 'Email',
    comment: 'Text input for email address',
  })
}

export function emailPlaceholder() {
  return t({
    message: 'me@somewhere.org',
    comment: 'Placeholder for the email address text input',
  })
}

function FirstNameInputErrorRenderer({ error }: ErrorRendererProps<PetOwnerFields, '$.firstName'>) {
  return (
    <Trans comment='error that is displayed when the first name input is too short'>
      First name must be at least {error.minimumLength} characters long
    </Trans>
  )
}

function SurnameInputErrorRenderer({ error }: ErrorRendererProps<PetOwnerFields, '$.firstName'>) {
  return (
    <Trans comment='error that is displayed when the last name input is too short'>
      Surname must be at least {error.minimumLength} characters long
    </Trans>
  )
}

function PhoneNumberErrorRenderer() {
  return <Trans comment='error shown when the user puts in a weird phone number'>Must be a valid phone number</Trans>
}

function EmailErrorRenderer() {
  return <Trans comment='error shown when the user puts in a weird email address'>Must be a valid email</Trans>
}

export type PetOwnerFieldsViewProps = FieldsViewProps<PetOwnerFields> & {
  clearField: (valuePath: PetOwnerValuePaths) => void
}

export function PetOwnerFieldsView({ clearField, ...props }: PetOwnerFieldsViewProps) {
  const form = useMantineFormFields(props)
  const FirstNameInput = form.textInput('$.firstName')
  const SurnameInput = form.textInput('$.surname')
  const EmailInput = form.textInput('$.email')
  const PhoneNumberInput = form.textInput('$.phoneNumber')

  const onClearPhoneNumber = useCallback(() => {
    clearField('$.phoneNumber')
  }, [clearField])

  const ClearPhoneNumberButton = useCallback(() => <CloseButton onClick={onClearPhoneNumber} />, [onClearPhoneNumber])

  return (
    <Stack>
      <Group align='start' grow preventGrowOverflow>
        <FirstNameInput
          ErrorRenderer={FirstNameInputErrorRenderer}
          autoCapitalize='words'
          label={firstNameLabel()}
          type='text'
        />
        <SurnameInput
          ErrorRenderer={SurnameInputErrorRenderer}
          autoCapitalize='words'
          label={surnameLabel()}
          type='text'
        />
      </Group>
      <PhoneNumberInput
        ErrorRenderer={PhoneNumberErrorRenderer}
        label={phoneNumberLabel()}
        placeholder={phoneNumberPlaceholder()}
        rightSection={<ClearPhoneNumberButton />}
        type='tel'
      />
      <EmailInput
        ErrorRenderer={EmailErrorRenderer}
        label={emailLabel()}
        placeholder={emailPlaceholder()}
        type='email'
      />
    </Stack>
  )
}

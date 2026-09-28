import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { Button, Card, Group, Pill, type PillProps, PillsInput, Stack } from '@mantine/core'
import { UnreachableError } from '@strictly/base'
import { MinimumStringLengthValidationErrorType } from '@strictly/define'
import { type ErrorRendererProps, type FieldsViewProps, useMantineFormFields } from '@strictly/react-form'
import { type ComponentType, type Ref, useCallback, useMemo } from 'react'
import { type PetFields, type PetValuePaths, TagAlreadyExistsErrorType, TagNotEmptyErrorType } from './fields'
import styles from './PetFieldsView.module.css'
import { PetOwnerFieldsView } from './PetOwnerFieldsView'
import { CatNameMustBeCapitalizedType, type TagValuePath } from './types'

export function submitLabel() {
  return t({
    message: 'Submit',
    comment: 'message that appears on the submit button for the pet form',
  })
}

export function forceValidateLabel() {
  return t({
    message: 'Force Validation',
    comment: 'message that appears on a button that forces the form fields to validate',
  })
}

export function nameTextInputLabel() {
  return t({
    message: 'Name',
    comment: 'label for the name text input',
  })
}

export function ownerCheckboxLabel() {
  return t({
    message: 'Has Owner?',
    comment: 'label for a checkbox indicating the pet has an owner',
  })
}

export function aliveCheckboxLabel() {
  return t({
    message: 'Alive?',
    comment: 'label for the alive checkbox',
  })
}

export function tagsInputLabel() {
  return t({
    message: 'Tags',
    comment: 'label for the list of tags',
  })
}

export function newTagPlaceholder() {
  return t({
    message: 'A new tag',
    comment: 'placeholder text for new tag',
  })
}

export type PetFormFields = Pick<
  PetFields,
  | '$.name'
  | '$.alive'
  | '$.newTag'
  | '$.owner'
  | '$.owner.firstName'
  | '$.owner.surname'
  | '$.owner.email'
  | '$.owner.phoneNumber'
  | '$.tags'
  | `$.tags.${number}`
>

export type PetFieldsViewProps = FieldsViewProps<PetFormFields> & {
  SpeciesComponent: ComponentType
  onSubmit: () => void
  onForceValidate: () => void
  onRemoveTag: (valuePath: TagValuePath) => void
  onClearField: (valuePath: PetValuePaths) => void
  submitDisabled: boolean
  firstInputRef?: Ref<HTMLInputElement>
}

function NameInputErrorRenderer({ error }: ErrorRendererProps<PetFormFields, '$.name'>) {
  switch (error.type) {
    case MinimumStringLengthValidationErrorType:
      return (
        <Trans comment='error that is displayed when the name input is too short'>
          Name must be at least {error.minimumLength} characters long
        </Trans>
      )
    case CatNameMustBeCapitalizedType:
      return (
        <Trans comment='error when the format of cat names is wrong'>
          Cat names must start with a capital letter. Know your place human!
        </Trans>
      )
    default:
      throw new UnreachableError(error)
  }
}

function NewTagInputErrorRenderer({ error }: ErrorRendererProps<PetFormFields, '$.newTag'>) {
  switch (error.type) {
    case MinimumStringLengthValidationErrorType:
      return (
        <Trans comment='error that is displayed when the new tag input is too short'>
          New tag must be at least {error.minimumLength} characters long
        </Trans>
      )
    case TagAlreadyExistsErrorType:
      return (
        <Trans comment='error shown when the user tries to add a tag that already exists'>
          A tag with the value "{error.value}" already exists
        </Trans>
      )
    case TagNotEmptyErrorType:
      return (
        <Trans comment='error shown when the user attempts to save the form when there is an uncommitted tag'>
          Unsaved tag value "{error.value}"
        </Trans>
      )
    default:
      throw new UnreachableError(error)
  }
}

export function PetFieldsView(props: PetFieldsViewProps) {
  const { onSubmit, onRemoveTag, onForceValidate, submitDisabled, SpeciesComponent, onClearField, firstInputRef } =
    props
  const form = useMantineFormFields(props)
  const NameTextInput = form.textInput('$.name')
  const AliveCheckbox = form.checkbox('$.alive')
  const OwnerCheckbox = form.checkbox('$.owner')
  const NewTagInputField = form.textInput('$.newTag', PillsInput.Field)
  const Tags = form.list('$.tags')
  const { Component: Owner, callbackMapper: ownerCallbackMapper } = form.fieldsView('$.owner', PetOwnerFieldsView)

  const onClearOwnerField = useMemo(() => ownerCallbackMapper(onClearField), [ownerCallbackMapper, onClearField])

  const NewTagField = form.fieldView('$.newTag')
  const HasOwnerField = form.fieldView('$.owner')

  return (
    <Stack>
      <NameTextInput ErrorRenderer={NameInputErrorRenderer} label={nameTextInputLabel()} ref={firstInputRef} />
      <AliveCheckbox label={aliveCheckboxLabel()} />
      <NewTagField>
        {({ error, ErrorSink, disabled, required }) => (
          <PillsInput
            disabled={disabled}
            error={error && <NewTagInputErrorRenderer error={error} />}
            label={tagsInputLabel()}
            required={required}
          >
            <Pill.Group>
              <Tags>
                {function (tagValuePath) {
                  const Pill = form.pill(tagValuePath, TagPill)
                  return (
                    <Pill
                      key={tagValuePath}
                      onRemoveByValuePath={onRemoveTag}
                      valuePath={tagValuePath}
                      withRemoveButton
                    />
                  )
                }}
              </Tags>
              {/* PillsInput.Field does not display errors, so we need to get our container to do it */}
              <NewTagInputField ErrorRenderer={ErrorSink} placeholder={newTagPlaceholder()} />
            </Pill.Group>
          </PillsInput>
        )}
      </NewTagField>

      <Card withBorder>
        {/* TODO making the child fields disabled might be more interesting */}
        {
          <HasOwnerField>
            {({ value: hasOwner }) => (
              // normally the form hides our fields observing the data, but we
              // need to observe it here since we're not using a hook component
              <>
                <OwnerCheckbox
                  label={ownerCheckboxLabel()}
                  // oxlint-disable-next-line no-undefined -- undefined removes the padding
                  pb={hasOwner ? 'md' : undefined}
                />
                {hasOwner ? <Owner clearField={onClearOwnerField} /> : null}
              </>
            )}
          </HasOwnerField>
        }
      </Card>
      <Card withBorder>
        {/* TODO either use a SubForm or add the ability to use an editable form that takes an entire value here */}
        <SpeciesComponent />
      </Card>
      <Group flex={1}>
        <Button flex={1} onClick={onForceValidate}>
          {forceValidateLabel()}
        </Button>

        <Button className={styles.hot} disabled={submitDisabled} flex={1} onClick={onSubmit}>
          {submitLabel()}
        </Button>
      </Group>
    </Stack>
  )
}

function TagPill({
  valuePath,
  onRemoveByValuePath,
  ...props
}: PillProps & {
  valuePath: TagValuePath
  onRemoveByValuePath: (valuePath: TagValuePath) => void
}) {
  const onRemove = useCallback(
    function () {
      onRemoveByValuePath(valuePath)
    },
    [valuePath, onRemoveByValuePath],
  )
  return <Pill onRemove={onRemove} {...props} />
}

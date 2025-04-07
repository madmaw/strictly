import styles from './pet_fields_view.module.css'

import {
  t,
} from '@lingui/core/macro'
import {
  Button,
  Card,
  Pill,
  type PillProps,
  PillsInput,
  Stack,
} from '@mantine/core'
import { UnreachableError } from '@strictly/base'
import {
  MinimumStringLengthValidationErrorType,
} from '@strictly/define'
import {
  type ErrorOfField,
  type ErrorRendererProps,
  type FieldsViewProps,
  useMantineFormFields,
} from '@strictly/react-form'
import { Observer } from 'mobx-react'
import {
  type ComponentType,
  useCallback,
} from 'react'
import { type PetFields } from './fields'
import { PetOwnerFieldsView } from './pet_owner_fields_view'
import {
  type TagValuePath,
} from './types'

export function SubmitLabel() {
  return t({
    message: 'Submit',
    comment: 'message that appears on the submit button for the pet form',
  })
}

export function NameTextInputLabel() {
  return t({
    message: 'Name',
    comment: 'label for the name text input',
  })
}

export function OwnerCheckboxLabel() {
  return t({
    message: 'Has Owner?',
    comment: 'label for a checkbox indicating the pet has an owner',
  })
}

export function AliveCheckboxLabel() {
  return t({
    message: 'Alive?',
    comment: 'label for the alive checkbox',
  })
}

export function TagsInputLabel() {
  return t({
    message: 'Tags',
    comment: 'label for the list of tags',
  })
}

export function NewTagPlaceholder() {
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
  SpeciesComponent: ComponentType,
  onSubmit: () => void,
  onRemoveTag: (valuePath: TagValuePath) => void,
}

function NameInputErrorRenderer({ error }: ErrorRendererProps<ErrorOfField<PetFormFields['$.name']>>) {
  switch (error.type) {
    case MinimumStringLengthValidationErrorType:
      return t({
        message: `Name must be at least ${error.minimumLength} characters long`,
        comment: 'error that is displayed when the name input is too short',
      })
    default:
      throw new UnreachableError(error.type)
  }
}

function NewTagInputErrorRenderer({ error }: ErrorRendererProps<ErrorOfField<PetFormFields['$.newTag']>>) {
  switch (error.type) {
    case MinimumStringLengthValidationErrorType:
      return t({
        message: `New tag must be at least ${error.minimumLength} characters long`,
        comment: 'error that is displayed when the new tag input is too short',
      })
    default:
      throw new UnreachableError(error.type)
  }
}

export function PetFieldsView(props: PetFieldsViewProps) {
  const {
    onSubmit,
    onRemoveTag,
    SpeciesComponent,
  } = props
  const form = useMantineFormFields(props)
  const NameTextInput = form.textInput('$.name')
  const AliveCheckbox = form.checkbox('$.alive')
  const OwnerCheckbox = form.checkbox('$.owner')
  const NewTagInputField = form.textInput(
    '$.newTag',
    PillsInput.Field,
  )
  const Tags = form.list('$.tags')
  const Owner = form.fieldsView('$.owner', PetOwnerFieldsView)

  return (
    <Stack>
      <NameTextInput
        ErrorRenderer={NameInputErrorRenderer}
        label={NameTextInputLabel()}
      />
      <AliveCheckbox label={AliveCheckboxLabel()} />
      <PillsInput label={TagsInputLabel()}>
        <Pill.Group>
          <Tags>
            {function (tagValuePath) {
              const Pill = form.pill(tagValuePath, TagPill)
              return (
                <Pill
                  key={tagValuePath}
                  onRemoveByValuePath={onRemoveTag}
                  valuePath={tagValuePath}
                  withRemoveButton={true}
                />
              )
            }}
          </Tags>
          <NewTagInputField
            ErrorRenderer={NewTagInputErrorRenderer}
            placeholder={NewTagPlaceholder()}
          />
        </Pill.Group>
      </PillsInput>
      <Card withBorder={true}>
        {/* TODO making the child fields disabled might be more interesting */}
        {(
          <Observer>
            {() => {
              // normally the form hides our fields observing the data, but we
              // need to observe it here since we're not using a hook component
              return (
                <>
                  <OwnerCheckbox
                    label={OwnerCheckboxLabel()}
                    pb={form.fields['$.owner'].value ? 'md' : undefined}
                  />
                  {form.fields['$.owner'].value ? <Owner /> : null}
                </>
              )
            }}
          </Observer>
        )}
      </Card>
      <Card withBorder={true}>
        {/* TODO either use a SubForm or add the ability to use an editable form that takes an entire value here */}
        <SpeciesComponent />
      </Card>
      <Button
        className={styles.hot}
        onClick={onSubmit}
      >
        <SubmitLabel />
      </Button>
    </Stack>
  )
}

function TagPill({
  valuePath,
  onRemoveByValuePath,
  ...props
}: PillProps & {
  valuePath: TagValuePath,
  onRemoveByValuePath: (valuePath: TagValuePath) => void,
}) {
  const onRemove = useCallback(function () {
    onRemoveByValuePath(valuePath)
  }, [
    valuePath,
    onRemoveByValuePath,
  ])
  return (
    <Pill
      onRemove={onRemove}
      {...props}
    />
  )
}

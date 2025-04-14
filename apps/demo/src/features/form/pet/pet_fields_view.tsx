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
  type ErrorRendererProps,
  type FieldsViewProps,
  FieldView,
  useMantineFormFields,
} from '@strictly/react-form'
import { Observer } from 'mobx-react'
import {
  type ComponentType,
  useCallback,
  useMemo,
} from 'react'
import {
  type PetFields,
  TagAlreadyExistsErrorType,
} from './fields'
import { PetOwnerFieldsView } from './pet_owner_fields_view'
import {
  type PetValuePaths,
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
  onClearField: (valuePath: PetValuePaths) => void,
}

function NameInputErrorRenderer({ error }: ErrorRendererProps<PetFormFields, '$.name'>) {
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

function NewTagInputErrorRenderer({ error }: ErrorRendererProps<PetFormFields, '$.newTag'>) {
  switch (error.type) {
    case MinimumStringLengthValidationErrorType:
      return t({
        message: `New tag must be at least ${error.minimumLength} characters long`,
        comment: 'error that is displayed when the new tag input is too short',
      })
    case TagAlreadyExistsErrorType:
      return t({
        message: `A tag with the value "${error.value}" already exists`,
        comment: 'error shown when the user tries to add a tag that already exists',
      })
    default:
      throw new UnreachableError(error)
  }
}

export function PetFieldsView(props: PetFieldsViewProps) {
  const {
    onSubmit,
    onRemoveTag,
    SpeciesComponent,
    onClearField,
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
  const {
    Component: Owner,
    callbackMapper: ownerCallbackMapper,
  } = form.fieldsView('$.owner', PetOwnerFieldsView)

  const onClearOwnerField = useMemo(() => {
    return ownerCallbackMapper(onClearField)
  }, [
    ownerCallbackMapper,
    onClearField,
  ])

  return (
    <Stack>
      <NameTextInput
        ErrorRenderer={NameInputErrorRenderer}
        label={NameTextInputLabel()}
      />
      <AliveCheckbox label={AliveCheckboxLabel()} />
      <FieldView
        fields={form.fields}
        valuePath='$.newTag'
      >
        {({
          error,
          ErrorSink,
        }) => (
          <PillsInput
            error={error && <NewTagInputErrorRenderer error={error} />}
            label={TagsInputLabel()}
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
                      withRemoveButton={true}
                    />
                  )
                }}
              </Tags>
              {/* PillsInput.Field does not display errors, so we need to get our container to do it */}
              <NewTagInputField
                ErrorRenderer={ErrorSink}
                placeholder={NewTagPlaceholder()}
              />
            </Pill.Group>
          </PillsInput>
        )}
      </FieldView>

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
                  {form.fields['$.owner'].value ? <Owner clearField={onClearOwnerField} /> : null}
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

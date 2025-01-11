// TODO typescript plugin https://www.npmjs.com/package/typescript-plugin-css-modules#visual-studio-code
// TODO remove project references
import styles from './pet_form.module.css'

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
  type FormProps,
  useMantineForm,
} from '@strictly/react-form'
import { observer } from 'mobx-react'
import {
  type ComponentType,
  useCallback,
} from 'react'
import { type PetFields } from './fields'
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
  '$.name' | '$.alive' | '$.newTag' | '$.owner' | '$.tags' | `$.tags.${number}`
>

export type PetFormProps = FormProps<PetFormFields> & {
  SpeciesComponent: ComponentType,
  OwnerComponent: ComponentType,
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

function PetFormImpl(props: PetFormProps) {
  const {
    onSubmit,
    onRemoveTag,
    OwnerComponent,
    SpeciesComponent,
  } = props
  const form = useMantineForm(props)
  const NameTextInput = form.textInput('$.name')
  const AliveCheckbox = form.checkbox('$.alive')
  const OwnerCheckbox = form.checkbox('$.owner')
  const NewTagInputField = form.textInput(
    '$.newTag',
    PillsInput.Field,
  )
  const Tags = form.list('$.tags')

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
          <NewTagInputField placeholder={NewTagPlaceholder()} />
        </Pill.Group>
      </PillsInput>
      <Card withBorder={true}>
        <OwnerCheckbox
          label={OwnerCheckboxLabel()}
          pb={form.fields['$.owner'].value ? 'md' : undefined}
        />
        {form.fields['$.owner'].value && <OwnerComponent />}
      </Card>
      <Card withBorder={true}>
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

export const PetForm = observer(PetFormImpl)

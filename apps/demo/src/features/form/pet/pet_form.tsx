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
  type ErrorRendererProps,
  type ErrorTypeOfField,
  type Field,
  type FlattenedFormFieldsOf,
  type FormProps,
  useMantineForm,
} from '@strictly/react-form'
import {
  type ComponentType,
  useCallback,
} from 'react'
import {
  type NAME_TOO_SHORT_ERROR,
  type PetValueToTypePaths,
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

export type PetFormFields = FlattenedFormFieldsOf<
  PetValueToTypePaths,
  {
    '$.name': Field<string, typeof NAME_TOO_SHORT_ERROR>,
    '$.alive': Field<boolean, never>,
    '$.newTag': Field<string, never>,
    '$.tags': Field<readonly string[], never>,
    '$.tags.*': Field<string, never>,
  }
>

export type PetFormProps = FormProps<PetFormFields> & {
  SpeciesComponent: ComponentType,
  onSubmit: () => void,
  onRemoveTag: (valuePath: TagValuePath) => void,
}

function NameInputErrorRenderer({ error }: ErrorRendererProps<ErrorTypeOfField<PetFormFields['$.name']>>) {
  switch (error.type) {
    case 'name too short':
      return t({
        message: `Name must be at least ${error.minLength} characters long`,
        comment: 'error that is displayed when the name input is too short',
      })
    default:
      throw new UnreachableError(error.type)
  }
}

export function PetForm(props: PetFormProps) {
  const {
    onSubmit,
    onRemoveTag,
    SpeciesComponent,
  } = props
  const form = useMantineForm(props)
  const NameTextInput = form.textInput('$.name')
  const AliveCheckbox = form.checkbox('$.alive')
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

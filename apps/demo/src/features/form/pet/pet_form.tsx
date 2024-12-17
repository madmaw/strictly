// TODO typescript plugin https://www.npmjs.com/package/typescript-plugin-css-modules#visual-studio-code
// TODO remove project references
import styles from './pet_form.module.css'

import {
  type Field,
  type FlattenedFormFieldsOf,
  type FormProps,
} from '@de/form-react'
import { useMantineForm } from '@de/form-react/mantine/hooks'
import {
  Button,
  Card,
  Pill,
  type PillProps,
  PillsInput,
  Stack,
} from '@mantine/core'
import {
  type ComponentType,
  useCallback,
} from 'react'
import {
  type NAME_TOO_SHORT_ERROR,
  type PetValueToTypePaths,
  type TagValuePath,
} from './types'

export const LABEL_SUBMIT = 'Submit'

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
      <NameTextInput label='Name' />
      <AliveCheckbox label='Alive' />
      <PillsInput label='Tags'>
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
          <NewTagInputField placeholder='A new tag' />
        </Pill.Group>
      </PillsInput>
      <Card withBorder={true}>
        <SpeciesComponent />
      </Card>
      <Button
        className={styles.hot}
        onClick={onSubmit}
      >
        {LABEL_SUBMIT}
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

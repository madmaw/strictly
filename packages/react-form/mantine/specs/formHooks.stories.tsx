import {
  Button,
  NumberInput,
  Stack,
} from '@mantine/core'
import { action } from '@storybook/addon-actions'
import {
  type Meta,
  type StoryObj,
} from '@storybook/react'
import {
  type FieldsViewProps,
  type FormProps,
} from 'core/Props'
import { useMantineFormFields } from 'mantine/hooks'
import { useCallback } from 'react'
import { type Field } from 'types/Field'

const onCancel = action('canceled')

function ErrorRenderer({ error }: { error: string }) {
  return `error ${error}`
}

function SubForm({
  value,
  onValueChange,
  onCancel,
}: FormProps<number> & {
  onCancel: () => void,
}) {
  const onChange = useCallback((v: number | string) => {
    onValueChange(Number.parseInt(`${v}`))
  }, [onValueChange])
  return (
    <Stack>
      <NumberInput
        allowDecimal={false}
        label='sub form'
        onChange={onChange}
        value={value}
      />
      <Button onClick={onCancel}>
        Cancel
      </Button>
    </Stack>
  )
}

function Component(props: FieldsViewProps<{
  $: Field<string, string>,
  '$.a': Field<number, string>,
}>) {
  const form = useMantineFormFields(props)
  const Form = form.form('$.a', SubForm)
  const TextInput = form.textInput('$')
  return (
    <Stack>
      <TextInput
        ErrorRenderer={ErrorRenderer}
        label='fields view'
      />
      <Form onCancel={onCancel} />
    </Stack>
  )
}

const meta: Meta<typeof Component> = {
  component: Component,
  args: {
    onFieldBlur: action('onFieldBlur'),
    onFieldFocus: action('onFieldFocus'),
    onFieldSubmit: action('onFieldSubmit'),
    onFieldValueChange: action('onFieldValueChange'),
  },
}

export default meta

type Story = StoryObj<typeof Component>

export const Empty: Story = {
  args: {
    fields: {
      $: {
        readonly: false,
        required: false,
        value: '',
      },
      '$.a': {
        readonly: false,
        required: false,
        value: 0,
      },
    },
  },
}

export const Populated: Story = {
  args: {
    fields: {
      $: {
        readonly: false,
        required: false,
        value: 'Hello',
      },
      '$.a': {
        readonly: false,
        required: false,
        value: 2,
      },
    },
  },
}

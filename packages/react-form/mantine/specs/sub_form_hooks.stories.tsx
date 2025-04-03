import {
  Stack,
} from '@mantine/core'
import { action } from '@storybook/addon-actions'
import {
  type Meta,
  type StoryObj,
} from '@storybook/react'
import { type FormProps } from 'core/props'
import { useMantineForm } from 'mantine/hooks'
import { type Field } from 'types/field'

function SubFormImpl(props: FormProps<{
  $: Field<string, string>,
}>) {
  const form = useMantineForm(props)
  const TextInput = form.textInput('$')
  return <TextInput label='sub form' />
}

function Component(props: FormProps<{
  $: Field<string, string>,
  '$.a': Field<string, string>,
}>) {
  const form = useMantineForm(props)
  const SubForm = form.subForm('$.a', SubFormImpl)
  const TextInput = form.textInput('$')
  return (
    <Stack>
      <TextInput label='form' />
      <SubForm />
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
        value: '',
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
        value: 'World',
      },
    },
  },
}

export const Required: Story = {
  args: {
    fields: {
      $: {
        readonly: false,
        required: true,
        value: 'xxx',
      },
      '$.a': {
        readonly: false,
        required: true,
        value: 'yyy',
      },
    },
  },
}

export const Disabled: Story = {
  args: {
    fields: {
      $: {
        readonly: true,
        required: false,
        value: 'xxx',
      },
      '$.a': {
        readonly: true,
        required: false,
        value: 'yyy',
      },
    },
  },
}

export const CustomError: Story = {
  args: {
    fields: {
      $: {
        readonly: false,
        required: false,
        value: 'xxx',
        error: 'form error',
      },
      '$.a': {
        readonly: false,
        required: false,
        value: 'xxx',
        error: 'sub form error',
      },
    },
  },
}

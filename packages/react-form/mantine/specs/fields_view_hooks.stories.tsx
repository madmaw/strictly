import {
  Button,
  Stack,
} from '@mantine/core'
import { action } from '@storybook/addon-actions'
import {
  type Meta,
  type StoryObj,
} from '@storybook/react'
import { type FieldsViewProps } from 'core/props'
import { useMantineFormFields } from 'mantine/hooks'
import { type Field } from 'types/field'

const onClick = action('some button clicked')

function ErrorRenderer({ error }: { error: string }) {
  return `error ${error}`
}

function SubFieldsView(props: FieldsViewProps<{
  $: Field<string, string>,
}> & {
  onClick: () => void,
}) {
  const form = useMantineFormFields(props)
  const TextInput = form.textInput('$')
  return (
    <Stack>
      <TextInput
        ErrorRenderer={ErrorRenderer}
        label='sub fields view'
      />
      <Button onClick={props.onClick}>
        Bonus Button
      </Button>
    </Stack>
  )
}

function Component(props: FieldsViewProps<{
  $: Field<string, string>,
  '$.a': Field<string, string>,
}>) {
  const form = useMantineFormFields(props)
  const FieldsView = form.fieldsView('$.a', SubFieldsView)
  const TextInput = form.textInput('$')
  return (
    <Stack>
      <TextInput
        ErrorRenderer={ErrorRenderer}
        label='fields view'
      />
      <FieldsView
        onClick={onClick}
      />
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

export const Errors: Story = {
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

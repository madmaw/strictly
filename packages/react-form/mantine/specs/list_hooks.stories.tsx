import {
  Code,
  Paper,
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

type ListPath = `$.${number}`

function Component(props: FormProps<{
  $: Field<string[], string>,
}>) {
  const form = useMantineForm(props)
  const List = form.list('$')
  return (
    <Paper
      p='sm'
      withBorder={true}
    >
      <Stack>
        <List>
          {function (valuePath: ListPath) {
            return (
              <Code key={valuePath}>
                ValuePath: {valuePath}
              </Code>
            )
          }}
        </List>
      </Stack>
    </Paper>
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
        value: [],
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
        value: [
          '$.4',
          '$.6',
          '$.19',
          '$.0',
        ],
      },
    },
  },
}

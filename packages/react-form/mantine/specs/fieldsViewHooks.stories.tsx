import {
  Paper,
  Stack,
  Text,
} from '@mantine/core'
import { action } from '@storybook/addon-actions'
import {
  type Meta,
  type StoryObj,
} from '@storybook/react'
import { type FieldsViewProps } from 'core/Props'
import { useMantineFormFields } from 'mantine/hooks'
import {
  useCallback,
  useMemo,
} from 'react'
import { type Field } from 'types/Field'

export function ParentFieldLabel() {
  return '$'
}

export function SubFieldLabel() {
  return '$ (child)'
}

function ErrorRenderer({ error }: { error: string }) {
  return `error ${error}`
}

function SubFieldsView({
  onClickField: onClickFieldImpl,
  ...props
}: FieldsViewProps<{
  $: Field<string, string>,
}> & {
  onClickField: (valuePath: '$') => void,
}) {
  const form = useMantineFormFields(props)
  const TextInput = form.textInput('$')
  const onClick$ = useCallback(() => {
    onClickFieldImpl('$')
  }, [onClickFieldImpl])
  return (
    <Stack>
      <TextInput
        ErrorRenderer={ErrorRenderer}
        label={SubFieldLabel()}
        onClick={onClick$}
      />
    </Stack>
  )
}

function Component({
  onClickField: onClickFieldImpl,
  ...props
}: FieldsViewProps<{
  $: Field<string, string>,
  '$.a': Field<string, string>,
}> & {
  onClickField: (valuePath: '$' | '$.a') => void,
}) {
  const form = useMantineFormFields(props)
  const {
    Component,
    callbackMapper,
  } = form.fieldsView('$.a', SubFieldsView)
  const TextInput = form.textInput('$')
  const onClick$ = useCallback(() => {
    onClickFieldImpl('$')
  }, [onClickFieldImpl])

  const onClickChildField = useMemo(() => {
    return callbackMapper(onClickFieldImpl)
  }, [
    onClickFieldImpl,
    callbackMapper,
  ])
  return (
    <Stack>
      <TextInput
        ErrorRenderer={ErrorRenderer}
        label={ParentFieldLabel()}
        onClick={onClick$}
      />
      <Paper
        p='sm'
        withBorder={true}
      >
        <Text>
          $.a
        </Text>
        <Component
          onClickField={onClickChildField}
        />
      </Paper>
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
    onClickField: action('onClickField'),
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

import {
  Button,
  Group,
  TextInput,
} from '@mantine/core'
import { action } from '@storybook/addon-actions'
import {
  type Meta,
  type StoryObj,
} from '@storybook/react'
import { type FieldsViewProps } from 'core/Props'
import { useMantineFormFields } from 'mantine/hooks'
import {
  type ChangeEvent,
  useCallback,
} from 'react'
import { type Field } from 'types/Field'

function Component(props: FieldsViewProps<{
  $: Field<string, string>,
}>) {
  const form = useMantineFormFields(props)
  const FieldView = form.fieldView('$')
  return (
    <FieldView>
      {({
        error,
        value,
        onBlur,
        onFocus,
        onSubmit,
        onValueChange,
      }) => {
        // this *is* a component eslint
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const onChange = useCallback(({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
          onValueChange(value)
        }, [onValueChange])
        return (
          <Group
            align='start'
            flex={1}
          >
            <TextInput
              error={error}
              flex={1}
              onBlur={onBlur}
              onChange={onChange}
              onFocus={onFocus}
              value={value}
            />
            {/* normally this would be done on enter, but with a field view you can implement it however you want */}
            <Button onClick={onSubmit}>
              Submit Field
            </Button>
          </Group>
        )
      }}
    </FieldView>
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
    },
  },
}

export const Populated: Story = {
  args: {
    fields: {
      $: {
        readonly: false,
        required: false,
        value: 'hello',
      },
    },
  },
}

export const Error: Story = {
  args: {
    fields: {
      $: {
        readonly: false,
        required: false,
        value: 'hello',
        error: 'no hellos allowed',
      },
    },
  },
}

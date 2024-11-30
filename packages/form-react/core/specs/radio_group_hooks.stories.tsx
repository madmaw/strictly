import {
  Radio,
  Stack,
} from '@mantine/core'
import { action } from '@storybook/addon-actions'
import {
  type Meta,
  type StoryObj,
} from '@storybook/react'
import {
  useFormRadioGroup,
} from 'core/hooks'
import { type FormProps } from 'core/props'
import { type Field } from 'types/field'

const VALUES = [
  '1',
  '2',
  '3',
] as const
type Value = typeof VALUES[number]
const DISPLAY_VALUES: Record<Value, string> = {
  1: 'One',
  2: 'Two',
  3: 'Three',
}

function Component(props: FormProps<{
  $: Field<string, Value | null>,
}>) {
  const inputProps = useFormRadioGroup('$', props)
  return (
    <Radio.Group
      {...inputProps}
      label='Checkbox'
    >
      <Stack>
        {VALUES.map(function (value: Value) {
          const label = DISPLAY_VALUES[value]
          return (
            <Radio
              key={label}
              label={label}
              value={value}
            />
          )
        })}
      </Stack>
    </Radio.Group>
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
        disabled: false,
        required: false,
        value: null,
      },
    },
  },
}

export const Populated: Story = {
  args: {
    fields: {
      $: {
        disabled: false,
        required: false,
        value: '3',
      },
    },
  },
}

export const Required: Story = {
  args: {
    fields: {
      $: {
        disabled: false,
        required: true,
        value: '1',
      },
    },
  },
}

export const Disabled: Story = {
  args: {
    fields: {
      $: {
        disabled: true,
        required: false,
        value: '2',
      },
    },
  },
}

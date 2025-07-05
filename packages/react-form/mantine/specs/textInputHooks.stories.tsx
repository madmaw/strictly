import {
  PillsInputField,
  Textarea,
  type TextInputProps,
} from '@mantine/core'
import { action } from '@storybook/addon-actions'
import {
  type Meta,
  type StoryObj,
} from '@storybook/react'
import { type FieldsViewProps } from 'core/Props'
import {
  type SuppliedTextInputProps,
  type TextInputTarget,
} from 'mantine/createTextInput'
import { useMantineFormFields } from 'mantine/hooks'
import {
  type ComponentType,
  type Ref,
} from 'react'
import { type Field } from 'types/Field'
import { TEXT_INPUT_LABEL } from './textInputConstants'

type StoryTextInputProps<T extends TextInputTarget> = SuppliedTextInputProps<T> & Pick<TextInputProps, 'label'>

function ErrorRenderer({ error }: { error: string }) {
  return `error ${error}`
}

function Component<T extends TextInputTarget>({
  TextInput,
  componentRef,
  ...props
}: FieldsViewProps<{
  $: Field<string, string>,
}> & {
  componentRef: Ref<HTMLInputElement>,
  TextInput?: ComponentType<StoryTextInputProps<T>>,
}) {
  const form = useMantineFormFields(props)
  const TextInputComponent = form.textInput<'$', StoryTextInputProps<T>>('$', TextInput)
  return (
    <TextInputComponent
      ErrorRenderer={ErrorRenderer}
      label={TEXT_INPUT_LABEL}
      ref={componentRef}
    />
  )
}

const meta: Meta<typeof Component> = {
  component: Component,
  args: {
    onFieldBlur: action('onFieldBlur'),
    onFieldFocus: action('onFieldFocus'),
    onFieldSubmit: action('onFieldSubmit'),
    onFieldValueChange: action('onFieldValueChange'),
    componentRef: action('componentRef'),
  },
}

export default meta

type Story<
  T extends TextInputTarget = HTMLInputElement,
> = StoryObj<typeof Component<T>>

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
        value: 'Hello',
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
    },
  },
}

export const Error: Story = {
  args: {
    fields: {
      $: {
        readonly: false,
        required: false,
        value: 'xxx',
        error: 'error',
      },
    },
  },
}

export const OverriddenTextarea: Story<HTMLTextAreaElement> = {
  args: {
    fields: {
      $: {
        readonly: false,
        required: false,
        value: 'Textarea',
      },
    },
    TextInput: Textarea,
  },
}

export const OverriddenPillsInputField: Story = {
  args: {
    fields: {
      $: {
        readonly: false,
        required: false,
        value: 'PillsInputField',
      },
    },
    TextInput: PillsInputField,
  },
}

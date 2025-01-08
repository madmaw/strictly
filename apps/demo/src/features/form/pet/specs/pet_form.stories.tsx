import { Card } from '@mantine/core'
import { action } from '@storybook/addon-actions'
import {
  type Meta,
  type StoryObj,
} from '@storybook/react'
import { MinimumStringLengthValidationErrorType } from '@strictly/define'
import { PetForm } from 'features/form/pet/pet_form'

const Component = PetForm

// TODO placeholder component
function SpeciesComponent() {
  return (
    <Card>
      <h1>
        Species
      </h1>
    </Card>
  )
}

const meta: Meta<typeof Component> = {
  component: Component,
  args: {
    onFieldBlur: action('onFieldBlur'),
    onFieldFocus: action('onFieldFocus'),
    onFieldValueChange: action('onFieldValueChange'),
    onFieldSubmit: action('onFieldSubmit'),
    onSubmit: action('onSubmit'),
    onRemoveTag: action('onRemoveTag'),
    SpeciesComponent,
  },
}

export default meta

type Story = StoryObj<typeof Component>

export const Populated: Story = {
  args: {
    fields: {
      '$.name': {
        disabled: false,
        value: 'Fido',
        required: true,
      },
      '$.alive': {
        disabled: false,
        value: true,
        required: false,
      },
      '$.tags': {
        disabled: false,
        required: false,
        value: [
          '$.tags.0',
          '$.tags.1',
          '$.tags.2',
        ],
      },
      '$.tags.0': {
        disabled: false,
        required: false,
        value: 'friendly',
      },
      '$.tags.1': {
        disabled: false,
        required: false,
        value: 'happy',
      },
      '$.tags.2': {
        disabled: false,
        required: false,
        value: 'little',
      },
      '$.newTag': {
        disabled: false,
        value: 'fake',
        required: false,
      },
    },
  },
}

export const Empty: Story = {
  args: {
    fields: {
      '$.name': {
        disabled: false,
        value: '',
        required: true,
      },
      '$.alive': {
        disabled: false,
        value: false,
        required: false,
      },
      '$.tags': {
        disabled: false,
        required: false,
        value: [],
      },
      '$.newTag': {
        disabled: false,
        value: '',
        required: false,
      },
    },
  },
}

export const Errors: Story = {
  args: {
    fields: {
      '$.name': {
        disabled: false,
        value: 'Bad',
        error: {
          type: MinimumStringLengthValidationErrorType,
          minimumLength: 8,
          receivedLength: 3,
        },
        required: true,
      },
      '$.alive': {
        disabled: false,
        value: false,
        required: false,
      },
      '$.tags': {
        disabled: false,
        required: false,
        value: ['$.tags.0'],
      },
      '$.tags.0': {
        disabled: false,
        required: false,
        value: 'ugly',
      },
      '$.newTag': {
        disabled: false,
        value: '',
        required: false,
      },
    },
  },
}

export const Disabled: Story = {
  args: {
    fields: {
      '$.name': {
        disabled: true,
        value: 'Fido',
        required: true,
      },
      '$.alive': {
        disabled: true,
        value: true,
        required: false,
      },
      '$.tags': {
        disabled: true,
        required: false,
        value: [
          '$.tags.0',
          '$.tags.1',
          '$.tags.2',
        ],
      },
      '$.tags.0': {
        disabled: true,
        required: false,
        value: 'friendly',
      },
      '$.tags.1': {
        disabled: true,
        required: false,
        value: 'happy',
      },
      '$.tags.2': {
        disabled: true,
        required: false,
        value: 'little',
      },
      '$.newTag': {
        disabled: true,
        value: 'fake',
        required: false,
      },
    },
  },
}

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

function OwnerComponent() {
  return (
    <Card>
      <h1>
        Owner
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
    OwnerComponent,
  },
}

export default meta

type Story = StoryObj<typeof Component>

export const Populated: Story = {
  args: {
    fields: {
      '$.name': {
        readonly: false,
        value: 'Fido',
        required: true,
      },
      '$.alive': {
        readonly: false,
        value: true,
        required: false,
      },
      '$.owner': {
        readonly: false,
        value: true,
        required: false,
      },
      '$.tags': {
        readonly: false,
        required: false,
        value: [
          '$.tags.0',
          '$.tags.1',
          '$.tags.2',
        ],
      },
      '$.tags.0': {
        readonly: false,
        required: false,
        value: 'friendly',
      },
      '$.tags.1': {
        readonly: false,
        required: false,
        value: 'happy',
      },
      '$.tags.2': {
        readonly: false,
        required: false,
        value: 'little',
      },
      '$.newTag': {
        readonly: false,
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
        readonly: false,
        value: '',
        required: true,
      },
      '$.alive': {
        readonly: false,
        value: false,
        required: false,
      },
      '$.owner': {
        readonly: false,
        value: false,
        required: false,
      },
      '$.tags': {
        readonly: false,
        required: false,
        value: [],
      },
      '$.newTag': {
        readonly: false,
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
        readonly: false,
        value: 'Bad',
        error: {
          type: MinimumStringLengthValidationErrorType,
          minimumLength: 8,
          receivedLength: 3,
        },
        required: true,
      },
      '$.alive': {
        readonly: false,
        value: false,
        required: false,
      },
      '$.owner': {
        readonly: false,
        value: true,
        required: false,
      },
      '$.tags': {
        readonly: false,
        required: false,
        value: ['$.tags.0'],
      },
      '$.tags.0': {
        readonly: false,
        required: false,
        value: 'ugly',
      },
      '$.newTag': {
        readonly: false,
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
        readonly: true,
        value: 'Fido',
        required: true,
      },
      '$.alive': {
        readonly: true,
        value: true,
        required: false,
      },
      '$.owner': {
        readonly: true,
        value: true,
        required: false,
      },
      '$.tags': {
        readonly: true,
        required: false,
        value: [
          '$.tags.0',
          '$.tags.1',
          '$.tags.2',
        ],
      },
      '$.tags.0': {
        readonly: true,
        required: false,
        value: 'friendly',
      },
      '$.tags.1': {
        readonly: true,
        required: false,
        value: 'happy',
      },
      '$.tags.2': {
        readonly: true,
        required: false,
        value: 'little',
      },
      '$.newTag': {
        readonly: true,
        value: 'fake',
        required: false,
      },
    },
  },
}

import { Card } from '@mantine/core'
import { action } from '@storybook/addon-actions'
import {
  type Meta,
  type StoryObj,
} from '@storybook/react'
import { PetForm } from 'features/form/pet/pet_form'
import {
  NAME_TOO_SHORT_ERROR,
} from 'features/form/pet/types'

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
        error: NAME_TOO_SHORT_ERROR,
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

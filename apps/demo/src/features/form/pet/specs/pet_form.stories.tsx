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
      },
      '$.alive': {
        disabled: false,
        value: true,
      },
      // '$.species': {
      //   disabled: false,
      //   value: 'cat',
      // },
      // '$.species.cat:meows': {
      //   disabled: false,
      //   value: '1',
      // },
      // '$.species.dog:barks': {
      //   disabled: true,
      //   value: '0',
      // },
    },
  },
}

export const Empty: Story = {
  args: {
    fields: {
      '$.name': {
        disabled: false,
        value: '',
      },
      '$.alive': {
        disabled: false,
        value: false,
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
      },
      '$.alive': {
        disabled: false,
        value: false,
      },
    },
  },
}

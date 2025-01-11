import { Card } from '@mantine/core'
import { action } from '@storybook/addon-actions'
import {
  type Meta,
  type StoryObj,
} from '@storybook/react'
import { PetSpeciesForm } from 'features/form/pet/pet_species_form'

const Component = PetSpeciesForm

// TODO placeholder component
function CatComponent() {
  return (
    <Card>
      <h1>
        Cat
      </h1>
    </Card>
  )
}

function DogComponent() {
  return (
    <Card>
      <h1>
        Dog
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
    speciesComponents: {
      cat: CatComponent,
      dog: DogComponent,
    },
  },
}

export default meta

type Story = StoryObj<typeof Component>

export const Cat: Story = {
  args: {
    fields: {
      '$.species': {
        readonly: false,
        value: 'cat',
        required: false,
      },
    },
  },
}

export const Dog: Story = {
  args: {
    fields: {
      '$.species': {
        readonly: false,
        value: 'dog',
        required: false,
      },
    },
  },
}

export const Disabled: Story = {
  args: {
    fields: {
      '$.species': {
        readonly: true,
        value: 'cat',
        required: false,
      },
    },
  },
}

export const Required: Story = {
  args: {
    fields: {
      '$.species': {
        readonly: false,
        value: 'cat',
        required: true,
      },
    },
  },
}

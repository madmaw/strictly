import { Card } from '@mantine/core'
import { action } from '@storybook/addon-actions'
import {
  type Meta,
  type StoryObj,
} from '@storybook/react'
import { MinimumStringLengthValidationErrorType } from '@strictly/define'
import { PetFieldsView } from 'features/form/pet/PetFieldsView'

const Component = PetFieldsView

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
    // TODO maybe allow overriding of OwnerComponent
  },
}

export default meta

type Story = StoryObj<typeof Component>

export const Populated: Story = {
  args: {
    fields: {
      '$.alive': {
        readonly: false,
        value: true,
        required: false,
      },
      '$.name': {
        readonly: false,
        value: 'Fido',
        required: true,
      },
      '$.newTag': {
        readonly: false,
        value: 'fake',
        required: false,
      },
      '$.owner': {
        readonly: false,
        value: true,
        required: false,
      },
      '$.owner.email': {
        readonly: false,
        value: 'x@y.z',
        required: false,
      },
      '$.owner.firstName': {
        readonly: false,
        value: 'Peggy',
        required: false,
      },
      '$.owner.phoneNumber': {
        readonly: false,
        value: '0404040404',
        required: false,
      },
      '$.owner.surname': {
        readonly: false,
        value: 'Sue',
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
        listIndexToKey: [
          0,
          1,
          2,
          3,
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
      '$.owner.email': {
        readonly: false,
        value: '',
        required: false,
      },
      '$.owner.firstName': {
        readonly: false,
        value: '',
        required: false,
      },
      '$.owner.phoneNumber': {
        readonly: false,
        value: '',
        required: false,
      },
      '$.owner.surname': {
        readonly: false,
        value: '',
        required: false,
      },
      '$.tags': {
        readonly: false,
        required: false,
        value: [],
        listIndexToKey: [0],
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
      '$.alive': {
        readonly: false,
        value: false,
        required: false,
      },
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
      '$.newTag': {
        readonly: false,
        value: '',
        required: false,
      },
      '$.owner': {
        readonly: false,
        value: true,
        required: false,
      },
      '$.owner.email': {
        readonly: false,
        value: '',
        required: false,
      },
      '$.owner.firstName': {
        readonly: false,
        value: '',
        required: false,
      },
      '$.owner.phoneNumber': {
        readonly: false,
        value: '',
        required: false,
      },
      '$.owner.surname': {
        readonly: false,
        value: '',
        required: false,
      },
      '$.tags': {
        readonly: false,
        required: false,
        value: ['$.tags.0'],
        listIndexToKey: [
          0,
          1000,
        ],
      },
      '$.tags.0': {
        readonly: false,
        required: false,
        value: 'ugly',
      },
    },
  },
}

export const Disabled: Story = {
  args: {
    fields: {
      '$.alive': {
        readonly: true,
        value: true,
        required: false,
      },
      '$.name': {
        readonly: true,
        value: 'Fido',
        required: true,
      },
      '$.newTag': {
        readonly: true,
        value: 'fake',
        required: false,
      },
      '$.owner': {
        readonly: true,
        value: true,
        required: false,
      },
      '$.owner.email': {
        readonly: true,
        value: '',
        required: false,
      },
      '$.owner.firstName': {
        readonly: true,
        value: '',
        required: false,
      },
      '$.owner.phoneNumber': {
        readonly: true,
        value: '',
        required: false,
      },
      '$.owner.surname': {
        readonly: true,
        value: '',
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
        listIndexToKey: [
          0,
          1,
          2,
          4,
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
    },
  },
}

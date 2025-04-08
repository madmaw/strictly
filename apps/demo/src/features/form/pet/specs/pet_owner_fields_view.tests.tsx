import { composeStories } from '@storybook/react'
import { toArray } from '@strictly/base'
import {
  render,
} from '@testing-library/react'
import * as stories from './pet_owner_fields_view.stories'

const composedStories = composeStories(stories)

describe('PetOwnerFieldsView', function () {
  it.each(toArray(composedStories))('renders %s', function (_name, Story) {
    const wrapper = render(<Story />)
    expect(wrapper.container).toMatchSnapshot()
  })
})

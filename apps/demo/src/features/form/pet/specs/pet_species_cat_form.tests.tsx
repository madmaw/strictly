import { toArray } from '@de/base'
import { composeStories } from '@storybook/react'
import {
  render,
} from '@testing-library/react'
import * as stories from './pet_species_cat_form.stories'

const composedStories = composeStories(stories)

describe('PetSpeciesCatForm', function () {
  it.each(toArray(composedStories))('renders %s', function (_name, Story) {
    const wrapper = render(<Story />)
    expect(wrapper.container).toMatchSnapshot()
  })
})

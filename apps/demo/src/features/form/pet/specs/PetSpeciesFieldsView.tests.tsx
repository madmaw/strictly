import { composeStories } from '@storybook/react-vite'
import { toArray } from '@strictly/base'
import { render } from '@testing-library/react'
import * as stories from './PetSpeciesFieldsView.stories'

const composedStories = composeStories(stories)

describe('PetSpeciesFieldsView', () => {
  it.each(toArray(composedStories))('renders %s', (_name, Story) => {
    const wrapper = render(<Story />)
    expect(wrapper.container).toMatchSnapshot()
  })
})

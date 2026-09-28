import { composeStories } from '@storybook/react-vite'
import { toArray } from '@strictly/base'
import { render } from '@testing-library/react'
import * as stories from './PetSpeciesDogFieldsView.stories'

const composedStories = composeStories(stories)

describe('PetSpeciesDogFieldsView', () => {
  it.each(toArray(composedStories))('renders %s', (_name, Story) => {
    const wrapper = render(<Story />)
    expect(wrapper.container).toMatchSnapshot()
  })
})

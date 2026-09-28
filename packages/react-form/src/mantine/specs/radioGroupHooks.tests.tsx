import { composeStories } from '@storybook/react-vite'
import { toArray } from '@strictly/base'
import { fireEvent, render, type RenderResult } from '@testing-library/react'
import { type Mock, vi } from 'vitest'
import {
  RADIO_GROUP_LABEL,
  RADIO_LABELS,
  RADIO_VALUES,
  type RadioValue,
} from './radioGroupConstants'
import * as stories from './radioGroupHooks.stories'

const composedStories = composeStories(stories)
const { Empty } = composedStories

describe('mantine radio group hooks', () => {
  it.each(toArray(composedStories))('renders %s', (_name, Story) => {
    const wrapper = render(<Story />)
    expect(wrapper.container).toMatchSnapshot()
  })

  describe('events', () => {
    let onFieldValueChange: Mock<(path: '$', value: RadioValue) => void>
    let onFieldFocus: Mock<(path: '$') => void>
    let onFieldBlur: Mock<(path: '$') => void>
    let wrapper: RenderResult
    let radioGroup: HTMLElement

    beforeEach(async () => {
      onFieldValueChange = vi.fn()
      onFieldFocus = vi.fn()
      onFieldBlur = vi.fn()
      wrapper = render(
        <Empty
          onFieldBlur={onFieldBlur}
          onFieldFocus={onFieldFocus}
          onFieldValueChange={onFieldValueChange}
        />,
      )
      radioGroup = await wrapper.findByLabelText(RADIO_GROUP_LABEL)
    })

    describe.each(RADIO_VALUES)('selects %s', (value) => {
      let radio: HTMLElement
      beforeEach(async () => {
        const label = RADIO_LABELS[value]
        radio = await wrapper.findByLabelText(label)
        fireEvent.click(radio)
      })

      it('fires onFieldValueChange', () => {
        expect(onFieldValueChange).toHaveBeenCalledOnce()
        expect(onFieldValueChange).toHaveBeenCalledWith('$', value)
      })
    })

    describe('focus', () => {
      beforeEach(() => {
        fireEvent.focus(radioGroup)
      })

      it('fires focus event', () => {
        expect(onFieldFocus).toHaveBeenCalledOnce()
        expect(onFieldFocus).toHaveBeenCalledWith('$')
      })

      describe('blur', () => {
        beforeEach(() => {
          fireEvent.blur(radioGroup)
        })

        it('fires blur event', () => {
          expect(onFieldBlur).toHaveBeenCalledOnce()
          expect(onFieldBlur).toHaveBeenCalledWith('$')
        })

        it('does not refire focus event', () => {
          expect(onFieldFocus).toHaveBeenCalledOnce()
        })
      })
    })
  })
})

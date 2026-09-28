import { composeStories } from '@storybook/react-vite'
import { toArray } from '@strictly/base'
import { fireEvent, render, type RenderResult } from '@testing-library/react'
import { type Mock, vi } from 'vitest'
import { CHECKBOX_LABEL } from './checkboxConstants'
import * as stories from './checkboxHooks.stories'

const composedStories = composeStories(stories)
const { Off, On } = composedStories

describe('mantine checkbox hooks', () => {
  it.each(toArray(composedStories))('renders %s', (_name, Story) => {
    const wrapper = render(<Story />)
    expect(wrapper.container).toMatchSnapshot()
  })

  describe.each([
    ['Off', Off, true],
    ['On', On, false],
  ] as const)('value change %s', (_name, Component, expectedValue) => {
    let onFieldValueChange: Mock<(path: '$', value: boolean) => void>
    let wrapper: RenderResult
    let checkbox: HTMLElement

    beforeEach(async () => {
      onFieldValueChange = vi.fn()
      wrapper = render(<Component onFieldValueChange={onFieldValueChange} />)
      checkbox = await wrapper.findByLabelText(CHECKBOX_LABEL)
    })

    it('requests toggle', () => {
      fireEvent.click(checkbox)
      expect(onFieldValueChange).toHaveBeenCalledOnce()
      expect(onFieldValueChange).toHaveBeenCalledWith('$', expectedValue)
    })
  })

  describe('other events', () => {
    let onFieldFocus: Mock<(path: '$') => void>
    let onFieldBlur: Mock<(path: '$') => void>
    let wrapper: RenderResult
    let checkbox: HTMLElement

    beforeEach(async () => {
      onFieldFocus = vi.fn()
      onFieldBlur = vi.fn()
      wrapper = render(
        <Off
          onFieldBlur={onFieldBlur}
          onFieldFocus={onFieldFocus}
        />,
      )
      checkbox = await wrapper.findByLabelText(CHECKBOX_LABEL)
    })

    describe('focus', () => {
      beforeEach(() => {
        fireEvent.focus(checkbox)
      })

      it('fires focus event', () => {
        expect(onFieldFocus).toHaveBeenCalledOnce()
        expect(onFieldFocus).toHaveBeenCalledWith('$')
      })

      describe('blur', () => {
        beforeEach(() => {
          fireEvent.blur(checkbox)
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

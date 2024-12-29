import { composeStories } from '@storybook/react'
import { toArray } from '@strictly/base'
import {
  fireEvent,
  render,
  type RenderResult,
} from '@testing-library/react'
import {
  type Mock,
  vi,
} from 'vitest'
import { CHECKBOX_LABEL } from './checkbox_constants'
import * as stories from './checkbox_hooks.stories'

const composedStories = composeStories(stories)
const {
  Off,
  On,
} = composedStories

describe('mantine checkbox hooks', function () {
  it.each(toArray(composedStories))('renders %s', function (_name, Story) {
    const wrapper = render(<Story />)
    expect(wrapper.container).toMatchSnapshot()
  })

  describe.each([
    [
      'Off',
      Off,
      true,
    ],
    [
      'On',
      On,
      false,
    ],
  ] as const)('value change %s', function (_name, Component, expectedValue) {
    let onFieldValueChange: Mock<(path: '$', value: boolean) => void>
    let wrapper: RenderResult
    let checkbox: HTMLElement

    beforeEach(async function () {
      onFieldValueChange = vi.fn()
      wrapper = render(<Component onFieldValueChange={onFieldValueChange} />)
      checkbox = await wrapper.findByLabelText(CHECKBOX_LABEL)
    })

    it('requests toggle', function () {
      fireEvent.click(checkbox)
      expect(onFieldValueChange).toHaveBeenCalledOnce()
      expect(onFieldValueChange).toHaveBeenCalledWith('$', expectedValue)
    })
  })

  describe('other events', function () {
    let onFieldFocus: Mock<(path: '$') => void>
    let onFieldBlur: Mock<(path: '$') => void>
    let wrapper: RenderResult
    let checkbox: HTMLElement

    beforeEach(async function () {
      onFieldFocus = vi.fn()
      onFieldBlur = vi.fn()
      wrapper = render((
        <Off
          onFieldBlur={onFieldBlur}
          onFieldFocus={onFieldFocus}
        />
      ))
      checkbox = await wrapper.findByLabelText(CHECKBOX_LABEL)
    })

    describe('focus', function () {
      beforeEach(function () {
        fireEvent.focus(checkbox)
      })

      it('fires focus event', function () {
        expect(onFieldFocus).toHaveBeenCalledOnce()
        expect(onFieldFocus).toHaveBeenCalledWith('$')
      })

      describe('blur', function () {
        beforeEach(function () {
          fireEvent.blur(checkbox)
        })

        it('fires blur event', function () {
          expect(onFieldBlur).toHaveBeenCalledOnce()
          expect(onFieldBlur).toHaveBeenCalledWith('$')
        })

        it('does not refire focus event', function () {
          expect(onFieldFocus).toHaveBeenCalledOnce()
        })
      })
    })
  })
})

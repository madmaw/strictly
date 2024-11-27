import { type ReadonlyRecord } from '@de/base'
import {
  fireEvent,
  render,
  type RenderResult,
} from '@testing-library/react'
import {
  useFormCheckBox,
  useFormInput,
} from 'react/hooks'
import {
  type FormProps,
} from 'react/props'
import { type FormField } from 'types/form_field'
import {
  type Mock,
  vitest,
} from 'vitest'

const TEST_ID = 'x'

type InputFormProps = FormProps<
  ReadonlyRecord<'$', FormField<string, string>>
>

function InputForm(props: InputFormProps) {
  const attributes = useFormInput('$', props)
  return (
    <input
      data-testid={TEST_ID}
      {...attributes}
    />
  )
}

type CheckboxFormProps = FormProps<
  Readonly<Record<'$', FormField<string, boolean>>>
>

function CheckBoxForm(props: CheckboxFormProps) {
  const attributes = useFormCheckBox('$', props)
  return (
    <input
      data-testid={TEST_ID}
      type='checkbox'
      {...attributes}
    />
  )
}

describe('hooks', function () {
  const onFieldBlur: Mock<(k: '$') => void> = vitest.fn()
  const onFieldFocus: Mock<(k: '$') => void> = vitest.fn()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onFieldValueChange: Mock<(k: '$', value: any) => void> = vitest.fn()
  const onFieldSubmit: Mock<(k: '$') => boolean> = vitest.fn()

  beforeEach(function () {
    onFieldBlur.mockReset()
    onFieldFocus.mockReset()
    onFieldValueChange.mockReset()
    onFieldSubmit.mockReset()
  })

  describe('input', function () {
    const props: InputFormProps = {
      fields: {
        $: {
          value: 'zzz',
          disabled: false,
        },
      },
      onFieldBlur,
      onFieldFocus,
      onFieldValueChange,
      onFieldSubmit,
    }

    it.each([
      'a',
      '',
      'hello world',
    ])('displays the value "%s"', async function (value) {
      const wrapper = render(
        (
          <InputForm
            {...props}
            fields={{
              $: {
                value,
                disabled: false,
              },
            }}
          />
        ),
      )
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const e = (await wrapper.findByTestId(TEST_ID)) as HTMLInputElement
      expect(e.value).toEqual(value)
    })

    describe('events', function () {
      let wrapper: RenderResult
      let e: HTMLElement
      beforeEach(async function () {
        wrapper = render(
          <InputForm {...props} />,
        )
        e = await wrapper.findByTestId(TEST_ID)
      })

      it('reports focus', function () {
        expect(onFieldFocus).not.toHaveBeenCalled()
        e.focus()
        expect(onFieldFocus).toHaveBeenCalledOnce()
        expect(onFieldFocus).toHaveBeenCalledWith('$')
      })

      it('reports blur', function () {
        e.focus()
        expect(onFieldBlur).not.toHaveBeenCalled()
        e.blur()
        expect(onFieldBlur).toHaveBeenCalledOnce()
        expect(onFieldBlur).toHaveBeenCalledWith('$')
      })

      it.each([
        'x',
        '',
        'asdf',
      ])('reports change to "%s"', function (value) {
        expect(onFieldValueChange).not.toHaveBeenCalled()
        fireEvent.change(e, { target: { value } })
        expect(onFieldValueChange).toHaveBeenCalledOnce()
        expect(onFieldValueChange).toHaveBeenCalledWith('$', value)
      })

      it('reports submit', function () {
        expect(onFieldSubmit).not.toHaveBeenCalled()
        fireEvent.keyUp(e, { key: 'Enter' })
        expect(onFieldSubmit).toHaveBeenCalledOnce()
        expect(onFieldSubmit).toHaveBeenCalledWith('$')
      })
    })
  })
  describe('checkbox', function () {
    const props: CheckboxFormProps = {
      fields: {
        $: {
          value: false,
          disabled: false,
        },
      },
      onFieldBlur,
      onFieldFocus,
      onFieldValueChange,
      onFieldSubmit,
    }

    it.each([
      true,
      false,
    ])('displays checked %s', async function (value) {
      const wrapper = render(
        (
          <CheckBoxForm
            {...props}
            fields={{
              $: {
                value,
                disabled: false,
              },
            }}
          />
        ),
      )
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const e = (await wrapper.findByTestId(TEST_ID)) as HTMLInputElement
      expect(e.checked).toEqual(value)
    })

    describe('events', function () {
      let wrapper: RenderResult
      let e: HTMLElement
      beforeEach(async function () {
        wrapper = render(
          <CheckBoxForm {...props} />,
        )
        e = await wrapper.findByTestId(TEST_ID)
      })

      it('reports focus', function () {
        expect(onFieldFocus).not.toHaveBeenCalled()
        e.focus()
        expect(onFieldFocus).toHaveBeenCalledOnce()
        expect(onFieldFocus).toHaveBeenCalledWith('$')
      })

      it('reports blur', function () {
        e.focus()
        expect(onFieldBlur).not.toHaveBeenCalled()
        e.blur()
        expect(onFieldBlur).toHaveBeenCalledOnce()
        expect(onFieldBlur).toHaveBeenCalledWith('$')
      })

      it('reports toggle checked', function () {
        expect(onFieldValueChange).not.toHaveBeenCalled()
        fireEvent.click(e)
        expect(onFieldValueChange).toHaveBeenCalledOnce()
        expect(onFieldValueChange).toHaveBeenCalledWith('$', true)
      })
    })
  })

  // radio group events are not an actual thing in HTML, only mantine
  // describe('radio group', function () {
  // })
})

import { Button, Checkbox, Stack } from '@mantine/core'
import { type Meta, type StoryObj } from '@storybook/react-vite'
import { CancellableHelper } from '@strictly/base'
import { useCancellableCallback } from 'cancel/useCancellableCallback'
import { useState } from 'react'
import { CancellablePromise } from 'real-cancellable-promise'
import { action } from 'storybook/actions'
import { userEvent, within } from 'storybook/test'

function delay(millis = 100) {
  return CancellablePromise.delay(millis)
}

const INITIAL_NAME = 'Click'
const SHOW_LABEL = 'Show'

function Component() {
  const [checked, setChecked] = useState(true)
  const onChange = () => {
    setChecked(!checked)
  }
  return (
    <Stack>
      <Checkbox
        checked={checked}
        label={SHOW_LABEL}
        onChange={onChange}
      />
      {checked && <Loader initialName={INITIAL_NAME} />}
    </Stack>
  )
}

const didSetName = action('setName')

function Loader({ initialName }: { initialName: string }) {
  const [name, setName] = useState(initialName)
  const [loading, setLoading] = useState(false)
  const callback = useCancellableCallback(() => {
    setLoading(true)
    return CancellableHelper.ignoreCancellationErrors(
      delay(1000).then(() => {
        setLoading(false)
        setName('Bob')
        didSetName('Bob')
      }),
    )
  }, [])
  return (
    <Button
      loading={loading}
      onClick={callback}
    >
      {name}
    </Button>
  )
}

const meta: Meta<typeof Component> = {
  args: {},
  component: Component,
}

export default meta

type Story = StoryObj<typeof Component>

export const Manual: Story = {
  args: {},
}

export const Automatic: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = await canvas.findByText(INITIAL_NAME)
    // put the UI into the expected/relevant state
    await userEvent.click(button)
  },
}

export const AutomaticCancel: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = await canvas.findByText(INITIAL_NAME)
    // put the UI into the expected/relevant state
    await userEvent.click(button)
    await delay(200)
    const showLabel = await canvas.findByText(SHOW_LABEL)
    await userEvent.click(showLabel)
  },
}

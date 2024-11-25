// adapted from https://storybook.js.org/docs/api/portable-stories/portable-stories-jest
import { setProjectAnnotations } from '@storybook/react'
import * as previewAnnotations from '../.storybook/preview'

const annotations = setProjectAnnotations([previewAnnotations])

// Run Storybook's beforeAll hook
beforeAll(annotations.beforeAll)

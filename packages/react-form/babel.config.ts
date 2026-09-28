import { type TransformOptions } from '@babel/core'

// shared by the library build and storybook so decorators and class fields are transformed the same way everywhere
const config: TransformOptions = {
  plugins: [
    [
      '@babel/plugin-proposal-decorators',
      {
        version: '2023-05',
      },
    ],
    ['@babel/plugin-transform-class-static-block'],
    ['@babel/plugin-proposal-class-properties'],
  ],
  assumptions: {
    setPublicClassFields: false,
  },
}

export default config

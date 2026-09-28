import { type TransformOptions } from '@babel/core'

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
    ['@lingui/babel-plugin-lingui-macro'],
  ],
  assumptions: {
    setPublicClassFields: false,
  },
}

export default config

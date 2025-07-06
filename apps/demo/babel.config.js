/* eslint-env node */
/** @type {import('@babel/core').TransformOptions} */
const config = {
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

module.exports = config

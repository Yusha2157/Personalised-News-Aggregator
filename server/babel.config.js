/**
 * Babel Configuration
 * Configuration for transpiling ES modules for Jest
 */

export default {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current'
        },
        modules: 'commonjs'
      }
    ]
  ],
  plugins: [
    '@babel/plugin-transform-runtime'
  ]
};

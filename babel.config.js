export default {
  presets: [
    ['@babel/preset-env', {targets: {node: 'current'}}],
    '@babel/preset-typescript',
  ],
  "plugins": [
    // ["babel-plugin-transform-builtin-classes", {
    //   "globals": ["Array", "Error", "HTMLElement"]
    // }]
  ],
};

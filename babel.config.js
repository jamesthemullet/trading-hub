module.exports = {
  presets: [
    [
      '@babel/preset-env',
      { targets: { node: 'current' } },
      '@babel/preset-react',
    ],
    '@babel/preset-typescript',
  ],
  plugins: [
    [
      '@babel/plugin-transform-runtime',
      {
        regenerator: true,
      },
    ],
    '@babel/plugin-syntax-jsx',
    '@babel/plugin-syntax-dynamic-import',
    `@babel/plugin-transform-private-methods`,
    [
      '@babel/plugin-transform-react-jsx',
      {
        runtime: 'automatic',
      },
    ],
  ],
};

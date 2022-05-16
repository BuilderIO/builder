module.exports = {
  entryPoints: [
    './src/components/builder-component.component.tsx',
    './src/components/builder-content.component.tsx',
  ],
  out: 'docs',
  exclude: ['**/*.test.tsx?'],
};

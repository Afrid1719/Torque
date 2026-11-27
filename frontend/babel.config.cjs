const replaceImportMeta = ({ types }) => ({
  visitor: {
    MetaProperty(path) {
      if (
        path.node.meta.name === 'import' &&
        path.node.property.name === 'meta'
      ) {
        path.replaceWith(types.objectExpression([]))
      }
    },
  },
})

module.exports = {
  env: {
    test: {
      plugins: [replaceImportMeta],
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        ['@babel/preset-react', { runtime: 'automatic' }],
        '@babel/preset-typescript',
      ],
    },
  },
}

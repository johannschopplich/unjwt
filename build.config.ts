import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: ['src/index', 'src/crypto/node', 'src/crypto/web'],
  clean: true,
  declaration: true,
  externals: ['unjwt/crypto'],
  rollup: {
    emitCJS: true,
  },
})

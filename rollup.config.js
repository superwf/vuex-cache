import babel from 'rollup-plugin-babel'
import pkg from './package.json'

export default [
  {
    input: 'src/index.js',
    output: {
      name: 'vuex-cache',
      file: pkg['umd:main'],
      format: 'umd',
    },
    plugins: [
      babel({
        exclude: 'node_modules/**',
        runtimeHelpers: true,
      }),
    ],
  },
  {
    input: 'src/index.js',
    output: [
      { file: pkg.main, format: 'cjs' },
      { file: pkg.module, format: 'es' },
    ],
  },
]

import babel from 'rollup-plugin-babel'
import uglify from 'rollup-plugin-uglify'
import pkg from './package.json'

const uglifyPlugin = uglify({
  compress: {
    pure_getters: true,
    unsafe: true,
    unsafe_comps: true,
    warnings: false
  }
})

export default [
  {
    input: 'src/index.js',
    output: {
      name: 'vuex-cache',
      file: pkg['umd:main'],
      format: 'umd'
    },
    plugins: [
      babel({
        exclude: 'node_modules/**'
      }),
      uglifyPlugin
    ]
  },
  {
    input: 'src/index.js',
    output: [
      { file: pkg.main, format: 'cjs' },
      { file: pkg.module, format: 'es' }
    ],
    plugins: [uglifyPlugin]
  }
]

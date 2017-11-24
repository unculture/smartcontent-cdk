const path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')

module.exports = merge(baseConfig, {
  entry: {
        main: './test/events.es6.js',
    },
  output: {
    path: path.resolve(__dirname.split('/node_modules')[0], 'test'),
    filename: 'events.js'
  },
  plugins: [
    new UglifyJSPlugin({
      uglifyOptions: {
        ie8: false,
        ecma: 8,
        output: {
          comments: false,
          beautify: false,
        },
        warnings: false
      },
      sourceMap: true
    }),
  ],
})



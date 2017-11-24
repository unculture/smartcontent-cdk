const merge = require('webpack-merge');
const baseConfig = require('./webpack.config.js');
const ZipFilesPlugin = require('webpack-zip-files-plugin');
const webpack = require('webpack');
const path = require('path');
var WebpackOnBuildPlugin = require("on-build-webpack");
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
var fs = require("fs");
var moment = require("moment");

module.exports = merge(baseConfig, {
  entry: {
        main: './src/js/main.js',
    },
  output: {
    path: path.resolve(__dirname.split('/node_modules')[0], 'dist'),
    filename: 'js/[name].js'
  },
   plugins: [
    new WebpackOnBuildPlugin(function (stats) {
      stats = stats.toJson()
      if (!stats.errors.length) {
        var htmlFileName = "index.html"
        var html = fs.readFileSync(path.join("./dist/", htmlFileName), "utf8")
        var mainScript = '<script type="text/javascript" src="js/main.js" inline ></script>' 
        html = html.replace(
          '<script id="main"></script>',
          mainScript
        )
        fs.writeFileSync(path.join("./dist", htmlFileName), html)
      }
    }),
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
    // Minify CSS
    new webpack.LoaderOptionsPlugin({
      minimize: true,
    }),

    new ZipFilesPlugin({
      output: path.resolve(__dirname.split('/node_modules')[0], 'zip', `${path.basename(__dirname)}_${moment().format("YYYYMMDD-HHmmss")}`),
      format: 'zip',
    }),
  ],
})



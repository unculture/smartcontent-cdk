const merge = require('webpack-merge');
const baseConfig = require('./webpack.config.js');
const ZipFilesPlugin = require('webpack-zip-files-plugin');
const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const path = require('path');
var WebpackOnBuildPlugin = require("on-build-webpack");
var fs = require("fs");
var moment = require("moment");

module.exports = merge(baseConfig, {
  entry: {
        main: './src/js/main.js',
    },
  output: {
    path: path.resolve(__dirname, 'dist'),
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
    new UglifyJsPlugin({
      sourceMap: false,
      compress: {
        warnings: false
      },
    }),
    // Minify CSS
    new webpack.LoaderOptionsPlugin({
      minimize: true,
    }),

    new ZipFilesPlugin({
      output: path.join(__dirname, `./zip/${path.basename(__dirname)}_${moment().format("YYYYMMDD-HHmmss")}`),
      format: 'zip',
    }),
  ],
})



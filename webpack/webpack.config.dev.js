const merge = require('webpack-merge');
const baseConfig = require('./webpack.config.js');
var WebpackOnBuildPlugin = require("on-build-webpack");
const path = require('path');
var fs = require("fs");

module.exports = merge(baseConfig, {
  entry: {
        main: './src/js/main.js',
        test: './src/js/test.js',
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
          var testScript = '<script type="text/javascript" src="js/test.js" inline ></script>' 
          html = html.replace(
            '<script id="main"></script>',
            mainScript
          )
          html = html.replace(
            '<script id="test"></script>',
            testScript
          )
          fs.writeFileSync(path.join("./dist", htmlFileName), html)
        }
      }),
    ],
  devServer: {
    contentBase: path.resolve(__dirname.split('/node_modules')[0], 'dist'),
    compress: true,
    port: 9000
  }
})



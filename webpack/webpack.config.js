const path = require('path');
const CopyWebpackPlugin = require("copy-webpack-plugin");
const WebpackOnBuildPlugin = require("on-build-webpack")
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const extractSass = new ExtractTextPlugin({
    filename: "css/[name].css",
});
const fs = require("fs");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const WebpackCleanupPlugin = require("webpack-cleanup-plugin");
const webpack = require('webpack');


module.exports = {
    module: {
        rules: [
	        {
	            test: /\.scss$/,
	            use: extractSass.extract({
	                use: [
                    {
  	                    loader: "css-loader",
                        options: {
                          minimize: true, 
                          sourceMap: true,
                        }
  	                }, 
                    {
                      loader: "postcss-loader",
                      options: {
                        ident: "postcss",
                        plugins: function () {
                          return [
                            require("autoprefixer")
                          ];
                        },
                        sourceMap: true,
                      }
                    },
                    {
                      loader: "sass-loader",
                      options: {
                        sourceMap: true,
                      }
                    },
                  ],
	                // use style-loader in development
	                fallback: "style-loader"
	            })
	        },
    			{
    				test: /\.html$/,
    				loader: 'vue-template-loader',
    				options: {
    					hmr: false
    				} 
    			},
          {
              test: /\.(eot|svg|ttf|woff|woff2)$/,
              loader: 'file-loader?name=../dist/fonts/[name].[ext]'
          },
          {
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: [require('babel-preset-env')],
                plugins: [require('babel-plugin-transform-object-rest-spread')]
              }
            }
          }
        ]
    },
 plugins: [
    new CleanWebpackPlugin(['zip/*.*'], {root: path.resolve(__dirname.split('/node_modules')[0]), verbose: true, dry: false}),
    new WebpackCleanupPlugin(),
    new CopyWebpackPlugin([
        { from: 'src/images', to: 'images' },
        { from: 'src/videos', to: 'videos' },
        { from: 'src/fonts', to: 'fonts' },       
        { from: 'src/index.html'},            
    ], {
        copyUnmodified: true
    }),
    new webpack.EnvironmentPlugin([
      'NODE_ENV',
    ]),
		extractSass
    ],
};


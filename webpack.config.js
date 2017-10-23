module.exports = {
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'buble',
        exclude: /node_modules(?!\/smartcontent-cdk)/
      }
    ]
  }
}
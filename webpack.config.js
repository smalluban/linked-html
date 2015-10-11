var webpack = require('webpack');

module.exports = {
  entry: "./linked-html",
  output: {
    path: "./dist/",
    libraryTarget: "umd",
    library: "LinkedHtml",
    filename: "linked-html.js"
  },
  module: {
    loaders: [
      { test: /\.js$/, loader: 'babel' }
    ]
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({compress: { warnings: false }})
  ],
  devtool: '#source-map'
};

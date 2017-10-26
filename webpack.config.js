var path = require('path');

module.exports = {
  devtool: 'inline-source-map',
  entry: [
      './src/main.tsx'
  ],
  output: {
      path: path.resolve(__dirname, 'public'),
      publicPath: '/',
      filename: 'bundle.js'
  },
  resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx']
  },
  node: { 
    fs: "empty" 
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader'
      },
      {
        test: /\.worker.js$/,
        loader: "worker-loader"
      }
    ]
  },
};

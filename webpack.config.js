var path = require('path');
var AureliaWebpackPlugin = require('aurelia-webpack-plugin');
var ProvidePlugin = require('webpack/lib/ProvidePlugin');

module.exports = {
  debug: true,
  devtool: '#eval-source-map',
  entry: [
      './src/main'
  ],
  output: {
      path: path.join(__dirname, 'public'),
      publicPath: '/',
      filename: 'bundle.js'
  },
  plugins: [
    new AureliaWebpackPlugin(),
    new ProvidePlugin({
      Promise: 'bluebird'
    })
  ],
  resolve: {
      root: path.resolve('./src'),
      extensions: ['', '.js']
  },
  node: { 
    fs: "empty" 
  },
  module: {
    loaders: [
      { 
        test: /\.js$/, 
        loader: 'babel', 
        exclude: /node_modules/, 
        query: { 
          presets: ['es2015', 'stage-0'],
          plugins: ['transform-decorators-legacy'] 
        } 
      },
      {
        test: /\.json$/,
        loader: 'json'
      },
      { 
        test: /\.css?$/, 
        loader: 'style!css' 
      },
      { 
        test: /\.html$/, 
        loader: 'html'
      },
      { 
        test: /\.(png|gif|jpg)$/, 
        loader: 'url?limit=8192' 
      },
      { 
        test: /\.woff2(\?v=[0-9]\.[0-9]\.[0-9])?$/, 
        loader: 'url?limit=10000&minetype=application/font-woff2' 
      },
      { 
        test: /\.woff(\?v=[0-9]\.[0-9]\.[0-9])?$/, 
        loader: 'url?limit=10000&minetype=application/font-woff' 
      },
      { 
        test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, 
        loader: 'file' 
      },
      {
        test: /\.worker.js$/,
        loader: "worker"
      }
    ]
  },
  postLoaders: [{
      include: path.resolve(__dirname, 'node_modules/pixi.js'),
      loader: 'transform?brfs'
  }]
};

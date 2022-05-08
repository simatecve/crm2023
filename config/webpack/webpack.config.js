const { webpackConfig, merge } = require('shakapacker');
const webpack = require('webpack');
const { VueLoaderPlugin } = require('vue-loader');
const resolve = require('./resolve');
const path = require('path');

const moduleConfig = {
  module: {
    rules: [
      {
        test: /\.vue(\.erb)?$/,
        loader: 'vue-loader',
      },
      {
        test: /encoderWorker\.min\.js$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
        },
      },
    ],
  },
  node: {
    global: true,
  },
};

const moduleWebpackConfig = merge(moduleConfig, webpackConfig);

const customConfig = {
  entry: {
    sdk: {
      import: path.resolve('./app/javascript/sdk/index.js'),
      library: {
        name: 'chatwootSDK',
        type: 'var',
      },
    },
  },
  node: {
    global: true,
  },
  resolve,
  plugins: [
    new VueLoaderPlugin(),
    new webpack.DefinePlugin({
      // This is hack for vuelidate to work, should be removed in future.
      'process.env.BUILD': '"web"',
    }),
  ],
};

module.exports = merge(moduleWebpackConfig, customConfig);

const pathConfig = require('../config/path.config')

const webpack = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const entry = require('./utils/entry')

module.exports = {
  target: 'web',
  mode: 'development',
  entry: Object.assign({ global: pathConfig.global }, entry),
  output: {
    filename: 'js/[name].async.js',
    path: pathConfig.static,
    publicPath: '/static/'
  },
  resolve: {
    alias: {
      '@components': pathConfig.components
    },
    extensions: ['.jsx', '.js', '.json']
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [['@babel/preset-env']],
              plugins: [
                [
                  '@babel/plugin-transform-react-jsx',
                  {
                    pragma: 'h'
                  }
                ],
                ['@babel/plugin-proposal-export-namespace-from'],
                ['@babel/plugin-proposal-export-default-from']
              ]
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.VUE_ENV': '"client"',
      'process.env.buildTime': JSON.stringify(Date.now())
    }),
    new webpack.EnvironmentPlugin({ NODE_ENV: 'development' }),
    new webpack.ProvidePlugin({
      qs: 'query-string',
      axios: 'axios'
    }),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DllReferencePlugin({
      manifest: require(`${pathConfig.dll}/vendor.json`)
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[name].csr.[contenthash].css'
    }),

    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.NamedModulesPlugin()
  ]
}

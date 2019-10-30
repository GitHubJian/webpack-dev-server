module.exports = (api, options) => {
  api.chainWebpack(webpackConfig => {
    if (
      process.env.NODE_ENV !== 'production' &&
      process.env.NODE_ENV !== 'test'
    ) {
      webpackConfig
        .devtool('cheap-module-eval-source-map')
        .output.publicPath(options.publicPath)

      webpackConfig
        .plugin('hmr')
        .use(require('webpack/lib/HotModuleReplacementPlugin'))

      webpackConfig.output.globalObject('this')

      if (!process.env.VUE_CLI_TEST && options.devServer.progress !== false) {
        webpackConfig
          .plugin('progress')
          .use(require('webpack/lib/ProgressPlugin'))
      }
    }
  })
}

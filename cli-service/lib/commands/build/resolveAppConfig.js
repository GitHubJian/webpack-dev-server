module.exports = (api, args, options) => {
  const config = api.resolveChainableWebpackConfig()

  const targetDir = api.resolve(args.dest || options.outputDir)

  // if (args.dest && config.plugins.has('copy')) {
  //   config.plugin('copy').tap(args => {
  //     args[0][0].to = targetDir
  //     return args
  //   })
  // }

  const rawConfig = api.resolveWebpackConfig(config)

  if (args.entry && !options.pages) {
    rawConfig.entry = {
      app: api.resolve(args.entry)
    }
  }

  return rawConfig
}

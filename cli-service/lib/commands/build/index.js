const defaults = {
  clean: true,
  target: 'app',
  formats: 'commonjs,umd,umd-min',
  'unsafe-inline': true
}

const buildModes = {
  lib: 'library',
  wc: 'web component',
  'wc-async': 'web component (async)'
}

const modifyConfig = (config, fn) => {
  if (Array.isArray(config)) {
    config.forEach(c => fn(c))
  } else {
    fn(config)
  }
}

module.exports = (api, options) => {
  api.registerCommand(
    'build',
    {
      description: 'build for production',
      usage: 'vue-cli-service build [options] [entry|pattern]',
      options: {
        '--mode': `specify env mode (default: production)`,
        '--dest': `specify output directory (default: ${options.outputDir})`,
        '--modern': `build app targeting modern browsers with auto fallback`,
        '--no-unsafe-inline': `build app without introducing inline scripts`,
        '--target': `app | lib | wc | wc-async (default: ${defaults.target})`,
        '--formats': `list of output formats for library builds (default: ${defaults.formats})`,
        '--name': `name for lib or web-component mode (default: "name" in package.json or entry filename)`,
        '--no-clean': `do not remove the dist directory before building the project`,
        '--report': `generate report.html to help analyze bundle content`,
        '--report-json': 'generate report.json to help analyze bundle content',
        '--watch': `watch for changes`
      }
    },
    async (args, rawArgs) => {
      for (const key in defaults) {
        if (args[key] == null) {
          args[key] = defaults[key]
        }
      }
      args.entry = args.entry || args._[0]
      // if (args.target !== 'app') {
      // args.entry = args.entry || 'src/App.vue'
      // }
      args.entry = 'src/main.js'

      process.env.VUE_CLI_BUILD_TARGET = args.target
      // if (args.modern && args.target === 'app') {
      process.env.VUE_CLI_MODERN_MODE = true
      if (!process.env.VUE_CLI_MODERN_BUILD) {
        await build(
          Object.assign({}, args, {
            modernBuild: false,
            keepAlive: true
          }),
          api,
          options
        )
      }
      // }
    }
  )
}

async function build(args, api, options) {
  const fs = require('fs-extra')
  const path = require('path')
  const chalk = require('chalk')
  const webpack = require('webpack')
  const formatStats = require('./formatStats.js')
  const validateWebpackConfig = require('../../util/validateWebpackConfig.js')
  const {
    log,
    done,
    info,
    logWithSpinner,
    stopSpinner
  } = require('../../../../cli-shared-utils')

  log()

  const mode = api.service.mode
  if (args.target === 'app') {
    const bundleTag = args.modern
      ? args.modernBuild
        ? `modern bundle`
        : `legacy bundle`
      : ``
    logWithSpinner(`Building ${bundleTag}for ${mode}...`)
  } else {
    const buildMode = buildModes[args.target]
    if (buildMode) {
      const additionalParams =
        buildMode === 'library' ? ` (${args.formats})` : ``
      logWithSpinner(
        `Building for ${mode} as ${buildMode}${additionalParams}...`
      )
    } else {
      throw new Error(`Unknown build target: ${args.target}`)
    }
  }

  const targetDir = api.resolve(args.dest || options.outputDir)
  const isLegacyBuild =
    args.target === 'app' && args.modern && !args.modernBuild

  let webpackConfig
  webpackConfig = require('./resolveAppConfig.js')(api, args, options)

  validateWebpackConfig(webpackConfig, api, options, args.target)

  if (args.dest) {
    modifyConfig(webpackConfig, config => {
      config.output.path = targetDir
    })
  }

  if (args.watch) {
    modifyConfig(webpackConfig, config => {
      config.watch = true
    })
  }

  if (args.dashboard) {
    const DashboardPlugin = require('../../webpack/DashboardPlugin.js')
    modifyConfig(webpackConfig, config => {
      config.plugins.push(
        new DashboardPlugin({
          type: 'build',
          modernBuild: args.modernBuild,
          keepAlive: args.keepAlive
        })
      )
    })
  }

  if (args.report) {
  }

  if (args.clean) {
    await fs.remove(targetDir)
  }

  return new Promise((resolve, reject) => {
    debugger
    webpack(webpackConfig, (err, stats) => {
      stopSpinner(false)
      if (err) {
        return reject(err)
      }

      if (stats.hasErrors()) {
        return reject(`Build failed with errors.`)
      }

      if (!args.silent) {
        const targetDirShort = path.relative(api.service.context, targetDir)
        log(formatStats(stats, targetDirShort, api))
        if (args.target === 'app' && !isLegacyBuild) {
          if (!args.watch) {
            done(
              `Build complete. The ${chalk.cyan(
                targetDirShort
              )} directory is ready to be deployed.`
            )
            info(
              `Check out deployment instructions at ${chalk.cyan(
                `https://cli.vuejs.org/guide/deployment.html`
              )}\n`
            )
          } else {
            done(`Build complete. Watching for changes...`)
          }
        }
      }

      if (process.env.VUE_CLI_TEST) {
        console.log('Build complete.')
      }

      resolve()
    })
  })
}

module.exports.defaultModes = {
  build: 'production'
}

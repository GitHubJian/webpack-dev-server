const {
  info,
  hasProjectYarn,
  openBrowser,
  IpcMessenger
} = require('../../../cli-shared-utils')

const defaults = {
  host: '0.0.0.0',
  port: 8080,
  https: false
}

module.exports = (api, options) => {
  api.registerCommand(
    'serve',
    {
      description: 'start development server',
      usage: 'vue-cli-service serve [options] [entry]',
      options: {
        '--open': `open browser on server start`,
        '--copy': `copy url to clipboard on server start`,
        '--mode': `specify env mode (default: development)`,
        '--host': `specify host (default: ${defaults.host})`,
        '--port': `specify port (default: ${defaults.port})`,
        '--https': `use https (default: ${defaults.https})`,
        '--public': `specify the public network URL for the HMR client`
      }
    },
    async function serve(args) {
      info('Starting development server...')

      const isInContainer = checkInContainer()
      const isProduction = process.env.NODE_ENV === 'production'

      const url = require('url')
      const chalk = require('chalk')
      const webpack = require('webpack')
      const WebpackDevServer = require('webpack-dev-server')
      const portfinder = require('portfinder')
      const prepareURLs = require('../util/prepareURLs')
      const prepareProxy = require('../util/prepareProxy')
      const launchEditorMiddleware = require('launch-editor-middleware')
      const validateWebpackConfig = require('../util/validateWebpackConfig')
      const isAbsoluteUrl = require('../util/isAbsoluteUrl')

      api.chainWebpack(webpackConfig => {
        if (
          process.env.NODE_ENV !== 'production' &&
          process.env.NODE_ENV !== 'test'
        ) {
          webpackConfig.devtool('cheap-module-eval-source-map')

          webpackConfig
            .plugin('hmr')
            .use(require('webpack/lib/HotModuleReplacementPlugin'))

          webpackConfig.output.globalObject(
            `(typeof self !== 'undefined' ? self : this)`
          )

          if (
            !process.env.VUE_CLI_TEST &&
            options.devServer.progress !== false
          ) {
            webpackConfig
              .plugin('progress')
              .use(require('webpack/lib/ProgressPlugin'))
          }
        }
      })

      const webpackConfig = api.resolveWebpackConfig()

      validateWebpackConfig(webpackConfig, api, options)

      const projectDevServerOptions = Object.assign(
        webpackConfig.devServer || {},
        options.devServer
      )

      if (args.dashboard) {
        const DashboardPlugin = require('../webpack/DashboardPlugin')
        ;(webpackConfig.plugins = webpackConfig.plugins || []).push(
          new DashboardPlugin({
            type: 'serve'
          })
        )
      }

      const entry = args._[0]
      if (entry) {
        webpackConfig.entry = {
          app: api.resolve(entry)
        }
      }

      const useHttps =
        args.https || projectDevServerOptions.https || defaults.https
      const protocol = useHttps ? 'https' : 'http'
      const host =
        args.host ||
        process.env.HOST ||
        projectDevServerOptions.host ||
        defaults.host
      portfinder.basePort =
        args.port ||
        process.env.PORT ||
        projectDevServerOptions.port ||
        defaults.port
      const port = await portfinder.getPortPromise()
      const rawPublicUrl = args.public || projectDevServerOptions.public
      const publicUrl = rawPublicUrl
        ? /^[a-zA-Z]+:\/\//.test(rawPublicUrl)
          ? rawPublicUrl
          : `${protocol}://${rawPublicUrl}`
        : null

      const urls = prepareURLs(
        protocol,
        host,
        port,
        isAbsoluteUrl(options.publicPath) ? '/' : options.publicPath
      )
      const localUrlForBrowser = publicUrl || urls.localUrlForBrowser

      const proxySettings = prepareProxy(
        projectDevServerOptions.proxy,
        api.resolve('public')
      )

      if (!isProduction) {
        const sockjsUrl = publicUrl
          ? `?${publicUrl}/sockjs-node`
          : isInContainer
          ? ``
          : `?` +
            url.format({
              protocol,
              port,
              hostname: urls.lanUrlForConfig || 'localhost',
              pathname: '/sockjs-node'
            })
        const devClients = [
          require.resolve(`webpack-dev-server/client`) + sockjsUrl,
          require.resolve(
            projectDevServerOptions.hotOnly
              ? 'webpack/hot/only-dev-server'
              : 'webpack/hot/dev-server'
          )
        ]
        if (process.env.APPVEYOR) {
          devClients.push(`webpack/hot/poll?500`)
        }
        addDevClientToEntry(webpackConfig, devClients)
      }

      const compiler = webpack(webpackConfig)

      const server = new WebpackDevServer(
        compiler,
        Object.assign(
          {
            clientLogLevel: 'silent',
            historyApiFallback: {
              disableDotRule: true,
              rewrites: genHistoryApiFallbackRewrites(
                options.publicPath,
                options.pages
              )
            },
            contentBase: api.resolve('public'),
            watchContentBase: !isProduction,
            hot: !isProduction,
            quiet: true,
            compress: isProduction,
            publicPath: options.publicPath,
            overlay: isProduction // TODO disable this
              ? false
              : { warnings: false, errors: true }
          },
          projectDevServerOptions,
          {
            https: useHttps,
            proxy: proxySettings,
            before(app, server) {
              app.use(
                '/__open-in-editor',
                launchEditorMiddleware(() =>
                  console.log(
                    `To specify an editor, specify the EDITOR env variable or ` +
                      `add "editor" field to your Vue project config.\n`
                  )
                )
              )
              api.service.devServerConfigFns.forEach(fn => fn(app, server))
              projectDevServerOptions.before &&
                projectDevServerOptions.before(app, server)
            },
            open: false
          }
        )
      )

      ;['SIGINT', 'SIGTERM'].forEach(signal => {
        process.on(signal, () => {
          server.close(() => {
            process.exit(0)
          })
        })
      })

      if (process.env.VUE_CLI_TEST) {
        process.stdin.on('data', data => {
          if (data.toString() === 'close') {
            console.log('got close signal!')
            server.close(() => {
              process.exit(0)
            })
          }
        })
      }

      return new Promise((resolve, reject) => {
        let isFirstCompile = true
        compiler.hooks.done.tap('vue-cli-service serve', stats => {
          if (stats.hasErrors()) {
            return
          }

          let copied = ''
          if (isFirstCompile && args.copy) {
            try {
              require('clipboardy').writeSync(localUrlForBrowser)
              copied = chalk.dim('(copied to clipboard)')
            } catch (_) {}
          }

          const networkUrl = publicUrl
            ? publicUrl.replace(/([^/])$/, '$1/')
            : urls.lanUrlForTerminal

          console.log()
          console.log(`  App running at:`)
          console.log(
            `  - Local:   ${chalk.cyan(urls.localUrlForTerminal)} ${copied}`
          )

          if (!isInContainer) {
            console.log(`  - Network: ${chalk.cyan(networkUrl)}`)
          } else {
            console.log()
            console.log(
              chalk.yellow(
                `  It seems you are running Vue CLI inside a container.`
              )
            )
            if (
              !publicUrl &&
              options.publicPath &&
              options.publicPath !== '/'
            ) {
              console.log()
              console.log(
                chalk.yellow(
                  `  Since you are using a non-root publicPath, the hot-reload socket`
                )
              )
              console.log(
                chalk.yellow(
                  `  will not be able to infer the correct URL to connect. You should`
                )
              )
              console.log(
                chalk.yellow(
                  `  explicitly specify the URL via ${chalk.blue(
                    `devServer.public`
                  )}.`
                )
              )
              console.log()
            }
            console.log(
              chalk.yellow(
                `  Access the dev server via ${chalk.cyan(
                  `${protocol}://localhost:<your container's external mapped port>${options.publicPath}`
                )}`
              )
            )
          }
          console.log()

          if (isFirstCompile) {
            isFirstCompile = false
            if (!isProduction) {
              const buildCommand = hasProjectYarn(api.getCwd())
                ? `yarn build`
                : `npm run build`
              console.log(`  Note that the development build is not optimized.`)
              console.log(
                `  To create a production build, run ${chalk.cyan(
                  buildCommand
                )}.`
              )
            } else {
              console.log(`  App is served in production mode.`)
              console.log(`  Note this is for preview or E2E testing only.`)
            }
            console.log()

            if (args.open || projectDevServerOptions.open) {
              const pageUri =
                projectDevServerOptions.openPage &&
                typeof projectDevServerOptions.openPage === 'string'
                  ? projectDevServerOptions.openPage
                  : ''
              openBrowser(urls.localUrlForBrowser + pageUri)
            }

            // Send final app URL
            if (args.dashboard) {
              const ipc = new IpcMessenger()
              ipc.send({
                vueServe: {
                  url: urls.localUrlForBrowser
                }
              })
            }

            resolve({
              server,
              url: urls.localUrlForBrowser
            })
          } else if (process.env.VUE_CLI_TEST) {
            console.log('App updated')
          }
        })

        server.listen(port, host, err => {
          if (err) {
            reject(err)
          }
        })
      })
    }
  )
}

function addDevClientToEntry(config, devClient) {
  const { entry } = config
  if (typeof entry === 'object' && !Array.isArray(entry)) {
    Object.keys(entry).forEach(key => {
      entry[key] = devClient.concat(entry[key])
    })
  } else if (typeof entry === 'function') {
    config.entry = entry(devClient)
  } else {
    config.entry = devClient.concat(entry)
  }
}

function checkInContainer() {
  const fs = require('fs')
  if (fs.existsSync(`/proc/1/cgroup`)) {
    const content = fs.readFileSync(`/proc/1/cgroup`, 'utf-8')
    return /:\/(lxc|docker|kubepods)\//.test(content)
  }
}

function genHistoryApiFallbackRewrites(baseUrl, pages = {}) {
  const path = require('path')
  const multiPageRewrites = Object.keys(pages)
    .sort((a, b) => b.length - a.length)
    .map(name => ({
      from: new RegExp(`^/${name}`),
      to: path.posix.join(baseUrl, pages[name].filename || `${name}.html`)
    }))

  return [
    ...multiPageRewrites,
    { from: /./, to: path.posix.join(baseUrl, 'index.html') }
  ]
}

module.exports.defaultModes = {
  serve: 'development'
}

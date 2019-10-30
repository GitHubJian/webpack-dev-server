const fs = require('fs')
const path = require('path')
const debug = require('debug')
const chalk = require('chalk')
const readPkg = require('read-pkg')
const merge = require('webpack-merge')
const Config = require('webpack-chain')
const PluginAPI = require('./PluginAPI')
const dotenv = require('dotenv')
const dotenvExpand = require('dotenv-expand')
const defaultsDeep = require('lodash.defaultsdeep')
const { warn, error, isPlugin, loadModule } = require('../../cli-shared-utils')

const { defaults, validate } = require('./options')

module.exports = class Service {
  constructor(context, { plugins, pkg, inlineOptions, useBuiltIn } = {}) {
    process.VUE_CLI_SERVICE = this
    this.initialized = false
    this.context = context
    this.inlineOptions = this.inlineOptions
    this.webpackChainFns = []
    this.webpackRawConfigFns = []
    this.devServerConfigFns = []
    this.commands = {}
    this.pkgContext = context

    this.pkg = this.resolvePkg(pkg)

    this.plugins = this.resolvePlugins(plugins, useBuiltIn)

    this.modes = this.plugins.reduce((modes, { apply: { defaultModes } }) => {
      return Object.assign(modes, defaultModes)
    }, {})
  }

  resolvePkg(inlinePkg, context = this.context) {
    if (inlinePkg) {
      return inlinePkg
    } else if (fs.existsSync(path.join(context, 'package.json'))) {
      const pkg = readPkg.sync({ cwd: context })
      if (pkg.vuePlugins && pkg.vuePlugins.resolveFrom) {
        this.pkgContext = path.resolve(context, pkg.vuePlugins.resolveFrom)
        return this.resolvePkg(null, this.pkgContext)
      }
      return pkg
    } else {
      return {}
    }
  }

  init(mode = process.env.VUE_CLI_MODE) {
    if (this.initialized) {
      return
    }
    this.initialized = true
    this.mode = mode

    if (mode) {
      this.loadEnv(mode)
    }

    this.loadEnv()

    const userOptions = this.loadUserOptions()
    this.projectOptions = defaultsDeep(userOptions, defaults())

    debug('vue:project-config')(this.projectOptions)

    this.plugins.forEach(({ id, apply }) => {
      apply(new PluginAPI(id, this), this.projectOptions)
    })

    if (this.projectOptions.chainWebpack) {
      this.webpackChainFns.push(this.projectOptions.chainWebpack)
    }
    if (this.projectOptions.configureWebpack) {
      this.webpackRawConfigFns.push(this.projectOptions.configureWebpack)
    }
  }

  loadEnv(mode) {
    const logger = debug('vue:env')
    const basePath = path.resolve(this.context, `.env${mode ? `.${mode}` : ``}`)
    const localPath = `${basePath}.local`

    const load = envPath => {
      try {
        const env = dotenv.config({ path: envPath, debug: process.env.DEBUG })
        dotenvExpand(env)
        logger(envPath, env)
      } catch (err) {
        if (err.toString().indexOf('ENOENT') < 0) {
          error(err)
        }
      }
    }

    load(localPath)
    load(basePath)

    if (mode) {
      const shouldForceDefaultEnv =
        process.env.VUE_CLI_TEST && !process.env.VUE_CLI_TEST_TESTING_ENV
      const defaultNodeEnv =
        mode === 'production' || mode === 'test' ? mode : 'development'
      if (shouldForceDefaultEnv || process.env.NODE_ENV == null) {
        process.env.NODE_ENV = defaultNodeEnv
      }
      if (shouldForceDefaultEnv || process.env.BABEL_ENV == null) {
        process.env.BABEL_ENV = defaultNodeEnv
      }
    }
  }

  resolvePlugins(inlinePlugins, useBuiltIn) {
    const idToPlugin = id => ({
      id: id.replace(/^.\//, 'built-in:'),
      apply: require(id)
    })

    let plugins

    const builtInPlugins = [
      './commands/serve',
      './commands/build',
      // './commands/inspect',
      // './commands/help',
      './config/base',
      './config/css',
      './config/prod',
      './config/app'
    ].map(idToPlugin)

    if (inlinePlugins) {
      plugins =
        useBuiltIn !== false
          ? buildInPlugins.concat(inlinePlugins)
          : inlinePlugins
    } else {
      const projectPlugins = Object.keys(this.pkg.devDependencies || {})
        .concat(Object.keys(this.pkg.dependencies || {}))
        .filter(isPlugin)
        .map(id => {
          if (
            this.pkg.optionalDependencies &&
            id in this.pkg.optionalDependencies
          ) {
            let apply = () => {}
            try {
              apply = require(id)
            } catch (e) {
              warn(`Optional dependency ${id} is not installed.`)
            }

            return { id, apply }
          } else {
            return idToPlugin(id)
          }
        })
      plugins = builtInPlugins.concat(projectPlugins)
    }

    if (this.pkg.vuePlugins && this.pkg.vuePlugins.service) {
      const files = this.pkg.vuePlugins.service
      if (!Array.isArray(files)) {
        throw new Error(
          `Invalid type for option 'vuePlugins.service', expected 'array' but got ${typeof files}.`
        )
      }
      plugins = plugins.concat(
        files.map(file => ({
          id: `local:${file}`,
          apply: loadModule(`./${file}`, this.pkgContext)
        }))
      )
    }

    return plugins
  }

  async run(name, args = {}, rawArgv = []) {
    const mode =
      args.mode ||
      (name === 'build' && args.watch ? 'development' : this.modes[name])

    this.init(mode)

    args._ = args._ || []
    let command = this.commands[name]
    if (!command && name) {
      error(`command "${name}" does not exist.`)
      process.exit(1)
    }
    if (!command || args.help || args.h) {
      command = this.commands.help
    } else {
      args._.shift()
      rawArgv.shift()
    }
    const { fn } = command
    return fn(args, rawArgv)
  }

  resolveChainableWebpackConfig() {
    const chainableConfig = new Config()
    // apply chains
    this.webpackChainFns.forEach(fn => fn(chainableConfig))
    return chainableConfig
  }

  resolveWebpackConfig(chainableConfig = this.resolveChainableWebpackConfig()) {
    if (!this.initialized) {
      throw new Error(
        'Service must call init() before calling resolveWebpackConfig().'
      )
    }
    // get raw config
    let config = chainableConfig.toConfig()
    const original = config
    this.webpackRawConfigFns.forEach(fn => {
      if (typeof fn === 'function') {
        const res = fn(config)
        if (res) config = merge(config, res)
      } else if (fn) {
        config = merge(config, fn)
      }
    })

    if (config !== original) {
      cloneRuleNames(
        config.module && config.module.rules,
        original.module && original.module.rules
      )
    }

    const target = process.env.VUE_CLI_BUILD_TARGET
    if (
      !process.env.VUE_CLI_TEST &&
      (target && target !== 'app') &&
      config.output.publicPath !== this.projectOptions.publicPath
    ) {
      throw new Error(
        `Do not modify webpack output.publicPath directly. ` +
          `Use the "publicPath" option in vue.config.js instead.`
      )
    }

    const entryFiles = Object.values(config.entry || []).reduce(
      (allEntries, curr) => {
        return allEntries.concat(curr)
      },
      []
    )
    process.env.VUE_CLI_ENTRY_FILES = JSON.stringify(entryFiles)
      debugger
    return config
  }

  loadUserOptions() {
    let fileConfig, pkgConfig, resolved, resolvedFrom
    const configPath =
      process.env.VUE_CLI_SERVICE_CONFIG_PATH ||
      path.resolve(this.context, 'vue.config.js')
    if (fs.existsSync(configPath)) {
      try {
        fileConfig = require(configPath)

        if (typeof fileConfig === 'function') {
          fileConfig = fileConfig()
        }

        if (!fileConfig || typeof fileConfig !== 'object') {
          error(
            `Error loading ${chalk.bold(
              'vue.config.js'
            )}: should export an object or a function that returns object.`
          )
          fileConfig = null
        }
      } catch (error) {
        error(`Error loading ${chalk.bold('vue.config.js')}:`)
        throw e
      }
    }

    pkgConfig = this.pkg.vue
    if (pkgConfig && typeof pkgConfig !== 'object') {
      error(
        `Error loading vue-cli config in ${chalk.bold(`package.json`)}: ` +
          `the "vue" field should be an object.`
      )
      pkgConfig = null
    }

    if (fileConfig) {
      if (pkgConfig) {
        warn(
          `"vue" field in package.json ignored ` +
            `due to presence of ${chalk.bold('vue.config.js')}.`
        )
        warn(
          `You should migrate it into ${chalk.bold('vue.config.js')} ` +
            `and remove it from package.json.`
        )
      }
      resolved = fileConfig
      resolvedFrom = 'vue.config.js'
    } else if (pkgConfig) {
      resolved = pkgConfig
      resolvedFrom = '"vue" field in package.json'
    } else {
      resolved = this.inlineOptions || {}
      resolvedFrom = 'inline options'
    }

    if (resolved.css && typeof resolved.css.modules !== 'undefined') {
      if (typeof resolved.css.requireModuleExtension !== 'undefined') {
        warn(
          `You have set both "css.modules" and "css.requireModuleExtension" in ${chalk.bold(
            'vue.config.js'
          )}, ` +
            `"css.modules" will be ignored in favor of "css.requireModuleExtension".`
        )
      } else {
        warn(
          `"css.modules" option in ${chalk.bold('vue.config.js')} ` +
            `is deprecated now, please use "css.requireModuleExtension" instead.`
        )
        resolved.css.requireModuleExtension = !resolved.css.modules
      }
    }

    ensureSlash(resolved, 'publicPath')
    if (typeof resolved.publicPath === 'string') {
      resolved.publicPath = resolved.publicPath.replace(/^\.\//, '')
    }
    removeSlash(resolved, 'outputDir')

    validate(resolved, msg => {
      error(`Invalid options in ${chalk.bold(resolvedFrom)}: ${msg}`)
    })

    return resolved
  }
}

function ensureSlash(config, key) {
  let val = config[key]
  if (typeof val === 'string') {
    if (!/^https?:/.test(val)) {
      val = val.replace(/^([^/.])/, '/$1')
    }
    config[key] = val.replace(/([^/])$/, '$1/')
  }
}

function removeSlash(config, key) {
  if (typeof config[key] === 'string') {
    config[key] = config[key].replace(/\/$/g, '')
  }
}

function cloneRuleNames(to, from) {
  if (!to || !from) {
    return
  }
  from.forEach((r, i) => {
    if (to[i]) {
      Object.defineProperty(to[i], '__ruleNames', {
        value: r.__ruleNames
      })
      cloneRuleNames(to[i].oneOf, r.oneOf)
    }
  })
}

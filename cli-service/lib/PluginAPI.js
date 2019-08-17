const path = require('path')
const hash = require('hash-sum')
const semver = require('semver')
const {matchesPluginId} = require('@vue/cli-shared-utils')

class PluginAPI {
  constructor(id, service) {
    this.id = id
    this.service = service
  }

  get version() {
    return require('../package.json').version
  }

  assertVersion(range) {
    if (typeof range === 'number') {
      if (!Number.isInteger(range)) {
        throw new Error('Expected string or integer value.')
      }
      range = `^${range}.0.0-0`
    }
    if (typeof range !== 'string') {
      throw new Error('Expected string or integer value.')
    }

    if (semver.satisfies(this.version, range)) return

    throw new Error(
      `Require @vue/cli-service "${range}", but was loaded with "${
        this.version
      }".`
    )
  }

  getCwd() {
    return this.service.context
  }

  resolve(_path) {
    return path.resolve(this.service.context, _path)
  }

  hasPlugin(id) {
    return this.service.plugins.some(p => matchesPluginId(id, p.id))
  }

  registerCommand(name, opts, fn) {
    if (typeof opts === 'function') {
      fn = opts
      opts = null
    }
    this.service.commands[name] = {fn, opts: opts || {}}
  }

  chainWebpack(fn) {
    this.service.webpackChainFns.push(fn)
  }

  configureWebpack(fn) {
    this.service.webpackRawConfigFns.push(fn)
  }

  configureDevServer(fn) {
    this.service.devServerConfigFns.push(fn)
  }

  resolveWebpackConfig(chainableConfig) {
    return this.service.resolveWebpackConfig(chainableConfig)
  }

  resolveChainableWebpackConfig() {
    return this.service.resolveChainableWebpackConfig()
  }

  genCacheConfig(id, partialIdentifier, configFiles = []) {
    const fs = require('fs')
    const cacheDirectory = this.resolve(`node_modules/.cache/${id}`)

    const fmtFunc = conf => {
      if (typeof conf === 'function') {
        return conf.toString().replace(/\r\n?/g, '\n')
      }
      return conf
    }

    const variables = {
      partialIdentifier,
      'cli-service': require('../package.json').version,
      'cache-loader': require('cache-loader/package.json').version,
      env: process.env.NODE_ENV,
      test: !!process.env.VUE_CLI_TEST,
      config: [
        fmtFunc(this.service.projectOptions.chainWebpack),
        fmtFunc(this.service.projectOptions.configureWebpack)
      ]
    }

    if (!Array.isArray(configFiles)) {
      configFiles = [configFiles]
    }
    configFiles = configFiles.concat(['package-lock.json', 'yarn.lock'])

    const readConfig = file => {
      const absolutePath = this.resolve(file)
      if (!fs.existsSync(absolutePath)) {
        return
      }

      if (absolutePath.endsWith('.js')) {
        // should evaluate config scripts to reflect environment variable changes
        try {
          return JSON.stringify(require(absolutePath))
        } catch (e) {
          return fs.readFileSync(absolutePath, 'utf-8')
        }
      } else {
        return fs.readFileSync(absolutePath, 'utf-8')
      }
    }

    for (const file of configFiles) {
      const content = readConfig(file)
      if (content) {
        variables.configFiles = content.replace(/\r\n?/g, '\n')
        break
      }
    }

    const cacheIdentifier = hash(variables)
    return {cacheDirectory, cacheIdentifier}
  }
}

module.exports = PluginAPI

const chalk = require('chalk')
const semver = require('semver')
const invoke = require('./invoke')
const inquirer = require('inquirer')
const { resolveModule, loadModule } = require('@vue/cli-shared-utils')

const PackageManager = require('./util/ProjectPackageManager')
const {
  log,
  error,
  resolvePluginId,
  isOfficialPlugin
} = require('@vue/cli-shared-utils')
const confirmIfGitDirty = require('./util/confirmIfGitDirty')

async function add(pluginName, options = {}, context = process.cwd()) {
  if (!(await confirmIfGitDirty(context))) {
    return
  }

  const servicePkg = loadModule('@vue/cli-service/package.json', context)
  // if (servicePkg && semver.satisfies(servicePkg.version, '3.x')) {
  //   if (/^(@vue\/)?router$/.test(pluginName)) {
  //     return addRouter(context)
  //   }
  // }

  const packageName = resolvePluginId(pluginName)

  log()
  log(`📦  Installing ${chalk.cyan(packageName)}...`)
  log()

  const pm = new PackageManager({ context })

  const cliVersion = require('../package.json').version
  if (isOfficialPlugin(packageName) && semver.prerelease(cliVersion)) {
    await pm.add(`${packageName}@^${cliVersion}`)
  } else {
    await pm.add(packageName)
  }

  log(
    `${chalk.green('✔')}  Successfully installed plugin: ${chalk.cyan(
      packageName
    )}`
  )
  log()

  const generatorPath = resolveModule(`${packageName}/generator`, context)
  if (generatorPath) {
    invoke(pluginName, options, context)
  } else {
    log(`Plugin ${packageName} does not have a generator to invoke`)
  }
}

module.exports = (...args) => {
  return add(...args).catch(err => {
    error(err)
    if (!process.env.VUE_CLI_TEST) {
      process.exit(1)
    }
  })
}

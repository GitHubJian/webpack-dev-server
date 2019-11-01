#!/usr/bin/env node

const chalk = require('chalk')
const semver = require('semver')
const requiredVersion = '>=8.9'

function checkNodeVersion(wanted, id) {
  if (!semver.satisfies(process.version, wanted)) {
    console.log(
      chalk.red(
        'You are using Node ' +
          process.version +
          ', but this version of ' +
          id +
          ' requires Node ' +
          wanted +
          '.\nPlease upgrade your Node version.'
      )
    )
    process.exit(1)
  }
}

checkNodeVersion(requiredVersion, '@vue/cli')

if (semver.satisfies(process.version, '9.x')) {
  console.log(
    chalk.red(
      `You are using Node ${process.version}.\n` +
        `Node.js 9.x has already reached end-of-life and will not be supported in future major releases.\n` +
        `It's strongly recommended to use an active LTS version instead.`
    )
  )
}

const fs = require('fs')
const path = require('path')
const slash = require('slash')
const minimist = require('minimist')

const program = require('commander')

program
  .version(`@vue/cli ${require('../../package.json').version}`)
  .usage('<command> [options]')

program
  .command('create <app-name>')
  .description('create a new project powered by vue-cli-service')
  .action((name, cmd) => {
    const options = cleanArgs(cmd)

    if (minimist(process.argv.slice(3))._.length > 1) {
      console.log(
        chalk.yellow(
          "\n Info: You provided more than one argument. The first one will be used as the app's name, the rest are ignored."
        )
      )
    }

    require('../lib/create')(name, options)
  })

program.parse(process.argv)

function camelize(str) {
  return str.replace(/-(\w)/g, (_, c) => (c ? c.toUpperCase() : ''))
}

function cleanArgs(cmd) {
  const args = {}
  cmd.options.forEach(o => {
    const key = camelize(o.lang.replace(/^--/, ''))
    if (typeof cmd[key] !== 'function' && typeof cmd[key] !== 'undefined') {
      args[key] = cmd[key]
    }
  })
  return args
}

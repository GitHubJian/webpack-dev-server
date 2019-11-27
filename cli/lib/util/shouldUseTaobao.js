const chalk = require('chalk')
const execa = require('execa')
const { hasYarn, request } = require('@vue/cli-shared-utils')
const inquirer = require('inquirer')
const registries = require('./registries')
const { loadOptions, saveOptions } = require('../options')

async function ping(registry) {
  await request.get(`${registry}/vue-cli-version-marker/latest`)
  return registry
}

function removeSlash(url) {
  return url.replace(/\/$/, '')
}

let checked
let result

module.exports = async function shouldUseTaobao(command) {
  if (!command) {
    command = hasYarn() ? 'yarn' : 'npm'
  }
}

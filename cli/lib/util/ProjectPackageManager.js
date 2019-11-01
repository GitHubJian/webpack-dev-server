const fs = require('fs-extra')
const path = require('path')

const execa = require('execa')
const minimist = require('minimist')
const semver = require('semver')
const LRU = require('lru-cache')
const chalk = require('chalk')

const { hasYarn, hasProjectYarn } = require('../../../cli-shared-utils/lib/env')

class PackageManager {
  constructor({ context, forcePackageManager } = {}) {
    this.context = context

    if (forcePackageManager) {
      this.bin = forcePackageManager
    } else if (context) {
      this.bin = hasProjectYarn(context) ? 'yarn' : 'npm'
    } else {
      this.bin = loadOptions().packageManager || (hasYarn() ? 'yarn' : 'npm')
    }
  }
}

module.exports = PackageManager

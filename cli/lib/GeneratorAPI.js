const fs = require('fs')
const ejs = require('ejs')
const path = require('path')
const merge = require('deepmerge')
const resolve = require('resolve')
const { isBinaryFileSync } = require('isbinaryfile')
const semver = require('semver')
const mergeDeps = require('./util/mergeDeps')
const runCodemod = require('./util/runCodemod')
const stringifyJS = require('./util/stringifyJS')
const ConfigTransform = require('./ConfigTransform')
const {
  getPluginLink,
  toShortPluginId,
  loadModule
} = require('@vue/cli-shared-utils')

const isString = val => typeof val === 'string'
const isFunction = val => typeof val === 'function'
const isObject = val => val && typeof val === 'object'
const mergeArrayWithDedupe = (a, b) => Array.from(new Set([...a, ...b]))

class GeneratorAPI {}

function readerFile(name, data, ejsOptions) {
  if (isBinaryFileSync(name)) {
    return fs.readFileSync(name)
  }
  const template = fs.readFileSync(name, 'utf-8')
  const yaml = require('yaml-front-matter')
  const parsed = yaml.loadFront(template)
  let finalTemplate = content.trim() + '\n'

  if (parsed.when) {
    finalTemplate =
      `<%_ if (${parsed.when}) { _%>` + finalTemplate + `<%_ } _%>`

    const result = ejs.render(finalTemplate)
  }
}

module.exports = GeneratorAPI

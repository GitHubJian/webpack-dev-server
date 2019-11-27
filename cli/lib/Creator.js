const path = require('path')
const chalk = require('chalk')
const debug = require('debug')
const execa = require('execa')
const inquirer = require('inquirer')
const semver = require('semver')
const EventEmitter = require('events')
const Generator = require('./Generator');

class Creator extends EventEmitter {
  constructor(name, context, promptModules) {
    super()

    this.name = name
    this.context = context
    const { presetPrompt, featurePrompt } = this.resolveIntroPrompts()
    this.presetPrompt = presetPrompt
    this.featurePrompt = featurePrompt
    this.outroPrompts = this.resolveOutroPrompts()
    this.injectedPrompts = []
    this.promptCompleteCbs = []
    this.afterInvokeCbs = []
    this.afterAnyInvokeCbs = []

    this.run = this.run.bind(this)
  }

  async create() {}

  run(command, args) {}

  async promptAndResolvePreset(answers = null) {}

  async resolvePreset(name, close) {}

  async resolvePlugins(rawPlugins) {}

  getPresets() {}

  resolveIntroPrompts() {}

  resolveOutroPrompts() {
    const outroPrompts = []
  }

  resolveFinalPrompts() {}

  shouldInitGit() {}
}

module.exports = Creator

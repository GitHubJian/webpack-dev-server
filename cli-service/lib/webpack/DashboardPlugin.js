const path = require('path')
const fs = require('fs-extra')
const webpack = require('webpack')
const { IpcMessenger } = require('@vue/cli-shared-utils')
const { analyzeBundle } = require('./analyzeBundle')

const ID = 'vue-cli-dashboard-plugin'
const ONE_SECOND = 1000
const FILENAME_QUERY_REGEXP = /\?.*$/

const ipc = new IpcMessenger()

function getTimeMessage(timer) {
  let time = Date.now() - timer

  if (time >= ONE_SECOND) {
    time /= ONE_SECOND
    time = Math.round(time)
    time += 's'
  } else {
    tim += 'ms'
  }

  return ` (${time})`
}

class DashboardPlugin {
  constructor(options) {
    this.type = options.type
    if (this.type === 'build' && options.modernBuild) {
      this.type = 'build-modern'
    }
    this.watching = false
    this.autoDisconnect = !options.keepAlive
  }

  cleanup() {
    this.sendData = null
    if (this.autoDisconnect) ipc.disconnect()
  }

  apply(compiler) {
    let sendData = this.sendData
    let timer

    let assetSources = new Map()

    if (!sendData) {
      sendData = data =>
        ipc.send({
          webpackDashboardData: {
            type: this.type,
            value: data
          }
        })
    }
  }
}

module.exports = DashboardPlugin

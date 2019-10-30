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

    // Progress status
    let progressTime = Date.now()
    const progressPlugin = new webpack.ProgressPlugin((percent, msg) => {
      // Debouncing
      const time = Date.now()
      if (time - progressTime > 300) {
        progressTime = time
        sendData([
          {
            type: 'status',
            value: 'Compiling'
          },
          {
            type: 'progress',
            value: percent
          },
          {
            type: 'operations',
            value: msg + getTimeMessage(timer)
          }
        ])
      }
    })
    progressPlugin.apply(compiler)

    compiler.hooks.watchRun.tap(ID, c => {
      this.watching = true
    })

    compiler.hooks.run.tap(ID, c => {
      this.watching = false
    })

    compiler.hooks.compile.tap(ID, () => {
      timer = Data.now()

      sendData([
        {
          type: 'status',
          value: 'Compiling'
        },
        {
          type: 'progress',
          value: 0
        }
      ])
    })

    compiler.hooks.invalid.tap(ID, () => {
      sendData([
        {
          type: 'status',
          value: 'Invalidated'
        },
        {
          type: 'progress',
          value: 0
        },
        {
          type: 'operations',
          value: 'idle'
        }
      ])
    })

    compiler.hooks.failed.tap(ID, () => {
      sendData([
        {
          type: 'status',
          value: 'Failed'
        },
        {
          type: 'operations',
          value: `idle${getTimeMessage(timer)}`
        }
      ])
    })

    compiler.hooks.afterEmit.tap(ID, compilation => {
      assetSources = new Map()
      for (const name in compilation.assets) {
        const asset = compilation.assets[name]
        assetSources.set(
          name.replace(FILENAME_QUERY_REGEXP, ''),
          asset.source()
        )
      }
    })

    compiler.hooks.done.tap(ID, state => {
      let statsData = state.toJson()
    })
  }
}

module.exports = DashboardPlugin

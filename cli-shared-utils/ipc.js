const ipc = require('node-ipc')

const DEFAULT_ID = process.env.VUE_CLI_IPC || 'vue-cli'
const DEFAULT_IDLE_TIMEOUT = 3000
const DEFAULT_OPTIONS = {
  networkId: DEFAULT_ID,
  autoConnect: true,
  disconnectOnIdle: false,
  idleTimeout: DEFAULT_IDLE_TIMEOUT,
  namespaceOnProject: true
}

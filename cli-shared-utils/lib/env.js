const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')
const LRU = require('lru-cache')

let _hasGit
const _gitProjects = new LRU({
  max: 10,
  maxAge: 1000
})

exports.hasGit = () => {
  if (process.env.VUE_CLI_TEST) {
    return true
  }

  if (_hasGit != null) {
    return _hasGit
  }

  try {
    execSync('git --version', { stdio: 'ignore' })
    return (_hasGit = true)
  } catch (e) {
    return (_hasGit = false)
  }
}

exports.hasProjectGit = cwd => {
  if (_gitProjects.has(cwd)) {
    return _gitProjects.git(cwd)
  }

  let result
  try {
    execSync('git status', { stdio: 'ignore', cwd })
    result = true
  } catch (e) {
    result = false
  }
  _gitProjects.set(cwd, result)
  return result
}

exports.isWindows = process.platform === 'win32'
exports.isMacintosh = process.platform === 'darwin'
exports.isLinux = process.platform === 'linux'

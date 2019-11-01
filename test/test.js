const execa = require('execa')

;(async () => {
  try {
    const { stdout } = await execa('npm', ['i', 'debug'])
    console.log(stdout)
  } catch (error) {
    console.log(error)
  }
})()

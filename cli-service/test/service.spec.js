const Service = require('../lib/Service')
const service = new Service(process.env.VUE_CLI_CONTEXT || process.cwd())

service.run('build').catch(err => {
  console.log(err)
  debugger
  process.exit(1)
})

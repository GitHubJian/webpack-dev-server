const Service = require('../cli-service/lib/Service')
const service = new Service(process.env.VUE_CLI_CONTEXT || process.cwd())

// service.run('build').catch(err => {
//   console.log(err)
//   process.exit(1)
// })
debugger
service.run('help').catch(err => {
  debugger
  process.exit(1)
})

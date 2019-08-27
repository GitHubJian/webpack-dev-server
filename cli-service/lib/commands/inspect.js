module.exports = (api, options) => {
  api.registerCommand(
    'inspect',
    {
      description: 'inspect internal webpack config',
      usage: 'vue-cli-service inspect [options] [...paths]',
      options: {
        '--mode': 'specify env mode (default: development)',
        '--rule <ruleName>': 'inspect a specific module rule',
        '--plugin <pluginName>': 'inspect a specific plugin',
        '--rules': 'list all module rule names',
        '--plugins': 'list all plugin names',
        '--verbose': 'show full function definitions in output'
      }
    },
    args => {}
  )
}

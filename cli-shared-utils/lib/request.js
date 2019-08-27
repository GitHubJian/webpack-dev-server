exports.request = {
  get(uri) {
    const request = require('request-promise-native')
    const reqOpts = {
      method: 'GET',
      timeout: 3e4,
      resolveWithFullResponse: true,
      json: true,
      uri
    }

    return request(reqOpts)
  }
}

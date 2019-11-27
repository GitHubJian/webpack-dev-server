const semver = require('semver')

const leadRE = /^(~|\^|>=?)/
const rangeToVersion = r => r.replace(leadRE, '').replace(/x/g, '0')

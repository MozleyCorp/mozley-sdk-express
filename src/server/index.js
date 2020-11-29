'use strict'

const makeApp = require('./makeApp')
const makeEndpoint = require('./makeEndpoint')

module.exports.loadApp = makeApp
module.exports.makeEndpoint = makeEndpoint

// Shortcuts
module.exports = makeApp
module.exports.app = makeApp
module.exports.endpoint = makeEndpoint

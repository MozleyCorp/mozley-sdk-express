"use strict"

// IMPORTS
const logger = require("./tools/logger")
const server = require("./server")

// EXPORT
module.exports = server

// EXPORT TOOLS
module.exports.tools = {}
module.exports.tools.logger = logger

// SHORTCUTS
module.exports.logger = logger

'use strict'

const config = require('./config')
const loader = require('./loaders')
const Logger = require('./logger')

async function startServer () {
  const app = await loader()

  app
    .listen(config.port, () => {
      Logger.info(`
      ################################################
      🛡️  Server listening on port: ${config.port} 🛡️
      ################################################
    `)
    })
    .on('error', (err) => {
      Logger.error(err)
      process.exit(1)
    })
}

startServer()

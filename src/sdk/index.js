'use strict'

const { Router } = require('express')
const router = Router()

const makeEndpoint = require('../server/makeEndpoint')

module.exports = (app) => {
  app.use('/sdk', router)

  makeEndpoint(
    router,
    'get',
    '/test',
    {
      middlewares: [
        (req, res, next) => {
          req.favouriteNumber = 32
          next()
        }
      ]
    },
    (req, res, next) => {
      res.send(`Favourite number is ${req.favouriteNumber}`)
    }
  )
}

'use strict'

const { Joi } = require('celebrate')

const mzly = require('../src')
const app = mzly.app({
  environment: 'development',
  clientId: '',
  clientSecret: '',
  frontendOrigin: '*',
  onAuthenticatedRedirect: '',
  customMiddleware: [
    (req, res, next) => {
      req.userName = 'John'
      next()
    }
  ],

  loadRoutes: (app) => {
    mzly.endpoint(
      app,
      'get',
      '/',
      {
        validator: {
          query: {
            favouriteNumber: Joi.number().required()
          }
        }
      },
      (req, res, next) => {
        res.send(
					`Hi, ${req.userName}. Your favourite number is reported as ${req.query.favouriteNumber}.`
        )
      }
    )
  }
})

app.listen(3000, () => {
  console.log('Listening on 3000')
})

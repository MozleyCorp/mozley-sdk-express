const $ = require('./controllers')

module.exports = (app) => {
  app.get('/', $.root.index)

  app.get('/users', $.users.getUsers)
}

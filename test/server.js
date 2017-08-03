const micro = require('micro')

const store = {}

const createServer = () => {
  const server = micro(async (req, res) => {
    let paths = req.url.split('/').filter(x => x)
    paths.shift()
    let doc = paths.shift()
    if (req.method === 'POST') {
      let body = await micro.json(req)
      if (store[doc] && store[doc]._rev !== body._rev) {
        return micro.send(res, 409, {reason: 'Conflict'})
      }
      store[body._id] = body
      store[body._id]._rev = Math.random().toString()
      return micro.send(res, 201, {id: body._id, rev: body._rev})
    } else if (req.method === 'GET') {
      if (!store[doc]) return micro.send(res, 404, {reason: 'No doc'})
      return store[doc]
    }
    micro.send(res, 404, {})
  })
  return server
}

module.exports = createServer

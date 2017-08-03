const inmem = require('lucass/inmemory')
const createLedger = require('../')
const createServer = require('./server')
const test = require('tap').test

test(`couch: basic append`, async t => {
  let server = createServer()
  await server.listen(1234)
  t.tearDown(async () => {
    await server.close()
  })
  t.plan(3)
  let ledger = createLedger(inmem(), 'http://localhost:1234/db', 'test')
  let root = await ledger.append({text: 'test'}, null)
  t.same(root, await ledger.getRoot())
  let buff = await ledger._get(root)
  let block = JSON.parse(buff.toString())
  t.same(block.root, null)
  t.same(block.msg, { text: 'test' })
})

test('errors: root does not match', async t => {
  let server = createServer()
  await server.listen(1235)
  t.tearDown(async () => {
    await server.close()
  })
  t.plan(2)
  let ledger = createLedger(inmem(), 'http://localhost:1235/db', 'test')
  try {
    await ledger.append({}, 'asdf')
  } catch (e) {
    t.same(e.message, 'Root mismatch.')
    t.type(e, 'Error')
  }
})

test('errors: set Root without matching root', async t => {
  let server = createServer()
  await server.listen(1236)
  t.tearDown(async () => {
    await server.close()
  })
  t.plan(2)
  let ledger = createLedger(inmem(), 'http://localhost:1236/db', 'test')
  try {
    await ledger.setRoot('new', 'asdf')
  } catch (e) {
    t.same(e.message, 'old hash must match current hash.')
    t.type(e, 'Error')
  }
})

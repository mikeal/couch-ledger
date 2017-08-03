const AbstractLedger = require('abstract-ledger').AbstractLedger
const couch = require('couch')
const promisify = require('util').promisify

const propPromise = (inst, prop) => {
  return promisify((...args) => inst[prop](...args))
}

class CouchLedger extends AbstractLedger {
  constructor (store, couchurl, name) {
    super(store)
    let _couch = couch(couchurl)
    this._couchGet = propPromise(_couch, 'get')
    this._couchPost = propPromise(_couch, 'post')
    this.name = name
    this._versionMap = {}
  }
  async getRoot () {
    let response
    try {
      response = await this._couchGet(this.name)
    } catch (e) {
      /* Can't reliably generate other errors. */
      /* istanbul ignore else */
      if (e.statusCode === 404) return null
      /* istanbul ignore next */
      throw e
    }
    this._versionMap[response.root] = response._rev
    return response.root
  }
  async setRoot (old, hash) {
    if (await this.getRoot() === old) {
      let _rev = this._versionMap[old]
      return this._couchPost({_rev, _id: this.name, root: hash})
    } else {
      throw new Error('old hash must match current hash.')
    }
  }
}

module.exports = (...args) => new CouchLedger(...args)

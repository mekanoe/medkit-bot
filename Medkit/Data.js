const fs = require('fs')
const sqlite3 = require('sqlite3')

// const initialEphemeral = Map({
//   userEvents: Map(),
// })

// const initialPersistent = Map({
//   schema: 2,
//   servers: Map(),
//   status: Map({
//     state: 'online',
//     game: "DM me `help`"
//   }),
//   globalLogChannel: process.env.GLOBAL_LOG_CHANNEL || "",
//   adminPrefix: "*",
// })

// const initialObjects = {
//   server: Map({
//     modules: List(),
//     prefix: "!",
//     roles: Map({
//       mute: "",
//       nsfw: "",
//       no_nsfw: "",
//       moderator: "",
//       admin: "",
//     }),
//     logChannel: ""
//   }),
// }

const PATH = `${process.env.DATA_PATH || process.cwd()}/medkit-data.db3`

function q (query) {
  console.log(query)
  return query
}

class Data {
  constructor (medkit) {
    this.medkit = medkit

    let needsMigration = false
    if (!fs.existsSync(PATH)) {
      needsMigration = true
    }

    if (process.env.FORCE_RESET === '1') {
      try {
        fs.unlinkSync(PATH)
        console.warn('deleted database')
      } catch (e) {

      }
      needsMigration = true
    }

    // console.log('db path:', PATH)
    this.__path = PATH
    this.db = new sqlite3.cached.Database(PATH)

    if (needsMigration) {
      this.__migrate()
    }
  }

  _dbFetch (op, ...args) {
    return new Promise((resolve, reject) => {
      this.db[op].apply(this.db, [...args, (err, result) => { // eslint-disable-line no-useless-call
        if (err) {
          reject(err)
        }

        resolve(result)
      }])
    })
  }

  async __migrate () {
    console.warn('starting hot database migration')
    let sql = fs.readFileSync(`${__dirname}/../utils/dbsetup.sql`, 'utf8')
    await this._dbFetch('exec', sql)
    console.log('migration done')
  }

  async getMedkitSettings () {
    let rows = await this._dbFetch('all', 'select * from settings')

    let outObj = {}
    
    for (let v of rows) {
      outObj[v.key] = v.value
    }

    return outObj
  }

  setKV (table, data) {
    // Stringify data
    let values = Object.keys(data).map(k => `('${k}', '${data[k]}')`).join(', ')

    return this._dbFetch('exec', q(`INSERT OR REPLACE INTO ${table} (key, value) VALUES ${values}`))
  }

  async getFullServerModuleTree () {
    let rows = await this._dbFetch('all', 'select modules, server_id from servers')

    let outObj = {}

    for (let v of rows) {
      outObj[v.server_id] = v.modules.split(',')
    }

    return outObj
  }

  async getServerRoles (id) {
    const rows = await this._dbFetch('all', 'select * from servers_roles where server_id = ?', id)

    return rows.reduce((acc, val) => {
      return {
        ...acc,
        [val.role_spec]: val.role_id
      }
    }, {})
  }

  async getServerCommands (id) {
    // console.log(`q: "select command, response from custom_commands where server_id = ${id}"`)
    const rows = await this._dbFetch('all', 'select command, response from custom_commands where server_id = ?', id)

    return rows.reduce((acc, val) => {
      return {
        ...acc,
        [val.command]: val.response
      }
    }, {})
  }

  async getServer (id) {
    // console.log(`q: "select * from servers where server_id = ${id}"`)
    const server = await this._dbFetch('get', 'select * from servers where server_id = ?', id)

    if (server === undefined) {
      return null
    }

    server.modules = server.modules.split(',').filter(x => x !== '')

    const roles = await this.getServerRoles(id)
    server.roles = roles

    const commands = await this.getServerCommands(id)
    server.customCommands = commands

    return server
  }

  initServer (SC) {
    return this._dbFetch('exec', `INSERT INTO servers (server_id, modules, logChannel) VALUES ('${SC.id}', '', '');`)
  }
}

module.exports = Data

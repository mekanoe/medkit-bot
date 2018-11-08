class ServerContext {
  constructor (medkit, server, serverData = null) {
    this.Medkit = medkit

    this.S = server
    this.id = server.id

    this.roles = {}
    this.modules = []
    this.logChannel = ''

    this.customCommands = {}

    if (serverData !== null) {
      this.attachData(serverData)
    }
  }

  attachData (data) {
    this.modules = data.modules
    this.roles = data.roles
    this.logChannel = data.logChannel
    this.customCommands = data.customCommands
  }

  llc (text) {
    console.log(`LLC (${this.S.name} <${this.id}>):\n    ${text}`)

    if (this.logChannel === '') {
      return
    }

    this.Medkit.client.channels.get(this.logChannel).send(text)
  }

  gm (userID) {
    return this.S.members.get(userID)
  }

  /// ////////////
  // Modules ///
  /// //////////

  async syncModules () {
    await this.Medkit.Data._dbFetch('run', 'UPDATE servers SET modules=$modules WHERE server_id = $serverId', {
      $serverId: this.id,
      $modules: this.modules.join(',')
    })
    await this.Medkit.Commands.cache()
  }

  addModule (module) {
    this.modules.push(module)
    return this.syncModules()
  }

  rmModule (module) {
    this.modules = this.modules.filter(m => m !== module)
    return this.syncModules()
  }

  hasModule (module) {
    return this.modules.indexOf(module) !== -1
  }

  /// ////////////////////
  // Custom Commands ///
  /// //////////////////

  setCommand (command, response) {
    return new Promise((resolve, reject) => {
      this.Medkit.Data.db.run('INSERT OR REPLACE INTO custom_commands(server_id, command, response) VALUES (?, ?, ?)', this.id, command, response, (err) => {
        if (err !== null) return reject(err)
        resolve(this.customCommands[command] === undefined)
      })
    })
  }

  rmCommand (command) {
    return new Promise((resolve, reject) => {
      this.Medkit.Data.db.run('DELETE FROM custom_commands WHERE server_id = ? AND command = ?', this.id, command, (err) => {
        if (err !== null) return reject(err)
        resolve(this.customCommands[command] !== undefined)
      })
    })
  }

  /// //////////
  // Roles ///
  /// ////////

  addRole (role, name) {
    return new Promise((resolve, reject) => {
      // get role id from name
      let gr = this.S.roles.find('name', name)
      if (gr === null) {
        return reject(new Error('role not found'))
      }

      this.Medkit.Data.db.run('INSERT OR REPLACE INTO servers_roles(server_id, role_spec, role_id) VALUES (?, ?, ?)', this.id, role, gr.id, (err) => {
        if (err !== null) return reject(err)
        resolve(true)
      })
    })
  }

  // rmRole(role, name)

  userHasRole (UC, role) {
    if (this.roles[role] === undefined || UC.GM === null) {
      return false
    }
    return UC.GM.roles.exists('id', this.roles[role])
  }

  /// /////////
  // Misc ///
  /// ///////

  async setLogChannel (channel) {
    await this.Medkit.Data._dbFetch('run', 'UPDATE servers SET logChannel=? WHERE server_id=?', channel, this.id)
  }
}

module.exports = ServerContext

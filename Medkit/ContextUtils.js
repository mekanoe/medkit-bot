const ServerContext = require('./ServerContext')
const UserContext = require('./UserContext')

/// /
// This file has a bunch of generic, out-of-context *Context wrappers.

module.exports = {
  NewSC: async (medkit, id) => {
    const s = await medkit.Data.getServer(id)
    let guild = medkit.client.guilds.get(id)
    return new ServerContext(medkit, guild, s)
  },

  NewUC: async (medkit, id, SC = null) => {
    let user = medkit.client.users.get(id)
    return new UserContext(medkit, user, SC)
  }
}

const { NewSC, NewUC } = require('../ContextUtils')
const parseDuration = require('parse-duration')

class Timeouts {
  constructor (medkit) {
    this.Medkit = medkit
    setInterval(async () => {
      try {
        await this.processTimeouts()
      } catch (e) {
      }
    }, 5000)
  }

  async addTimeout ({SC, UC, userID, duration, reason}) {
    let date = new Date()
    let len = parseDuration(duration)
    let now = date.getTime()
    let then = now + len

    SC.gm(userID).addRole(SC.roles.timeout)
    await this.Medkit.Data._dbFetch('run', 'INSERT INTO timeouts (server_id, user_id, mod_user_id, start_time, end_time, duration, reason) VALUES (?, ?, ?, ?, ?, ?, ?)', SC.id, userID, UC.id, now, then, len, reason)
  }

  getTimeouts ({SC}) {
    return this.Medkit.Data._dbFetch('all', 'SELECT * FROM timeouts WHERE server_id = ?', SC.id)
  }

  async processTimeouts () {
    try {
      const rows = await this.Medkit.Data._dbFetch('all', 'SELECT server_id as serverID, user_id as userID FROM timeouts WHERE end_time <= ?', Date.now())

      const scCache = {}

      for (let {serverID, userID} of rows) {
        if (scCache[serverID] !== undefined) {
          this.removeTimeout({SC: scCache[serverID], userId: userID})
        } else {
          NewSC(this.Medkit, serverID).then((SC) => {
            scCache[SC.id] = SC
            this.removeTimeout({SC, userID})
          })
        }
      }
    } catch (e) {
      this.Medkit.internalError({
        Module: 'Moderation/Timeouts',
        System: 'processTimeouts'
      }, e)
    }
  }

  async removeTimeout ({SC, userID, modID = null}) {
    try {
      let UC = await NewUC(this.Medkit, userID, SC)
      UC.GM.removeRole(SC.roles.timeout)
      let extra = ''

      if (modID !== null) {
        extra = `This was reversed by <@${modID}>.`
      }

      SC.llc(`<@${userID}> is no longer timed out. ${extra}`)
    } catch (e) {
      this.Medkit.internalError({
        Module: 'Moderation/Timeouts',
        System: 'removeTimeout',
        User: `<@${userID}>`,
        Server: SC.S.name
      }, e)
    }

    await this.Medkit.Data._dbFetch('run', 'DELETE FROM timeouts WHERE user_id = ? AND server_id = ?', userID, SC.id)
  }
}

module.exports = Timeouts

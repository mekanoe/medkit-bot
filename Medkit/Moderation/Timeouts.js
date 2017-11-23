const { NewSC, NewUC } = require('../ContextUtils')
const parseDuration = require('parse-duration')

class Timeouts {
  constructor (medkit) {
    this.Medkit = medkit
    setInterval(() => { this.processTimeouts() }, 5000)
  }

  async addTimeout ({SC, UC, user_id, duration, reason}) {
    let date = new Date()
    let len = parseDuration(duration)
    let now = date.getTime()
    let then = now + len

    SC.S.member(user_id).addRole(SC.roles.timeout)
    await this.Medkit.Data._dbFetch('run', 'INSERT INTO timeouts (server_id, user_id, mod_user_id, start_time, end_time, duration, reason) VALUES (?, ?, ?, ?, ?, ?, ?)', SC.id, user_id, UC.id, now, then, len, reason)
  }

  getTimeouts ({SC}) {
    return this.Medkit.Data._dbFetch('all', 'SELECT * FROM timeouts WHERE server_id = ?', SC.id)
  }

  async processTimeouts () {
    try {
      const rows = await this.Medkit.Data._dbFetch('all', 'SELECT server_id, user_id FROM timeouts WHERE end_time <= ?', Date.now())

      const scCache = {}

      for (let {server_id, user_id} of rows) {
        if (scCache[server_id] !== undefined) {
          this.removeTimeout({SC: scCache[server_id], userId: user_id})
        } else {
          NewSC(this.Medkit, server_id).then((SC) => {
            scCache[SC.id] = SC
            this.removeTimeout({SC, userId: user_id})
          })
        }
      }
    } catch (e) {
      console.error('timeout processing error: ', e)
    }
  }

  async removeTimeout ({SC, userId, modId = null}) {
    let UC = await NewUC(this.Medkit, userId, SC)
    UC.GM.removeRole(SC.roles.timeout)

    let extra = ''

    if (modId !== null) {
      extra = `This was reversed by <@${modId}>.`
    }

    SC.llc(`<@${userId}> is no longer timed out. ${extra}`)
    await this.Medkit.Data._dbFetch('run', 'DELETE FROM timeouts WHERE user_id = ? AND server_id = ?', userId, SC.id)
  }
}

module.exports = Timeouts

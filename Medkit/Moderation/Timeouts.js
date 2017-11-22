const { NewSC, NewUC } = require('../ContextUtils')
const parseDuration = require('parse-duration')

class Timeouts {
  constructor (medkit) {
    this.Medkit = medkit
    setInterval(() => { this.processTimeouts() }, 5000)
  }

  addTimeout ({SC, UC, user_id, duration, reason}) {
    return new Promise((resolve, reject) => {
      let date = new Date()
      let len = parseDuration(duration)
      let now = date.getTime()
      let then = now + len

      this.Medkit.Data.db.run('INSERT INTO timeouts (server_id, user_id, mod_user_id, start_time, end_time, duration, reason) VALUES (?, ?, ?, ?, ?, ?, ?)', SC.id, user_id, UC.id, now, then, len, reason, (err) => {
        SC.S.member(user_id).addRole(SC.roles.timeout)

        if (err !== null) return reject(err)
        resolve(true)
      })
    })
  }

  processTimeouts () {
    this.Medkit.Data.db.all('SELECT * FROM timeouts WHERE end_time <= ?', Date.now(), (err, rows) => {
      if (err != null) {
        console.error(err)
      }

      let scCache = {}

      rows.forEach((rows) => {
        if (scCache[rows.server_id] !== undefined) {
          this.removeTimeout({SC: scCache[rows.server_id], user_id: rows.user_id})
        } else {
          NewSC(this.Medkit, rows.server_id).then((SC) => {
            scCache[SC.id] = SC
            this.removeTimeout({SC, user_id: rows.user_id})
          })
        }
      })
    })
  }

  removeTimeout ({SC, userId, modId = null}) {
    return new Promise((resolve, reject) => {
      this.Medkit.Data.db.run('DELETE FROM timeouts WHERE user_id = ? AND server_id = ?', userId, SC.id, (err) => {
        if (err !== null) return reject(err)

        NewUC(this.Medkit, userId, SC).then((UC) => {
          UC.GM.removeRole(SC.roles.timeout)

          let extra = ''

          if (modId !== null) {
            extra = `This was reversed by <@${modId}>.`
          }

          SC.llc(`<@${userId}> is no longer timed out. ${extra}`)
          resolve(true)
        })
      }
      )
    })
  }
}

module.exports = Timeouts

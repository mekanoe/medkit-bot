const CommandSet = require('./CommandSet')
const Command = require('./Command')
// const { NewSC, NewUC } = require('../ContextUtils')
const moment = require('moment')
const parseDuration = require('parse-duration')

class TimeoutCmd extends CommandSet {
  _register (as) {
    as(this.commands, 'timeouts', {perms: 2})
  }
  _boot () {
    this.commands = [
      new Command({
        regex: /timeout <?@?!?([0-9]+)>? ([0-9]+[a-zA-Z]?) ?(.*)?/,
        usage: 'timeout <mention> <time>',
        help: 'Times-out a user for X time.\nTime is either in seconds or accepts a human "1d" or "30m" style too. Minimum is 15s.',
        callback: (message, matches) => {
          if (!/[a-zA-Z]$/.test(matches[1])) {
            matches[1] = matches[1] + 's'
          }

          let duration = parseDuration(matches[1])

          if (Math.floor(duration / 1000) < 15) {
            message.reply('Timeout duration upped to 15s.')
            duration = 15000
          }

          let durationHuman = moment.duration(duration).humanize()

          let user = message.M.mentions.users.first()

          this.medkit.Moderation.Timeouts.addTimeout({
            SC: message.SC,
            UC: message.UC,
            user_id: user.id,
            duration: matches[1],
            reason: matches[2]
          }).then(() => {
            message.reply(`<@${user.id}> was timed out for ${durationHuman}.`)
            message.SC.llc(`**TIMEOUT:**\n- Moderator: <@${message.UC.U.id}>\n- User: <@${user.id}>\n- Duration: ${durationHuman} (${Math.floor(duration / 1000)} seconds)\n- Reason: ${matches[2]}`)
          })
        },
        sources: ['text']
      }),
      new Command({
        regex: /untimeout <@!([0-9]+)>/,
        usage: 'untimeout <mention>',
        help: 'Reverses a timeout.',
        callback: (message, matches) => {
          this.medkit.Moderation.Timeouts.removeTimeout({SC: message.SC, user_id: matches[0], mod_id: message.UC.id}).then(() => {
            message.reply(`<@${matches[0]}>'s timeout has been lifted.`)
          })
        },
        sources: ['text']
      })
    ]
  }
}

module.exports = TimeoutCmd

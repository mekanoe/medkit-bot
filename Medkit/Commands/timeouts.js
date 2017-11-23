const CommandSet = require('../CommandSet')
const Command = require('../Command')
// const { NewSC, NewUC } = require('../ContextUtils')
const moment = require('moment-timezone')
const parseDuration = require('parse-duration')

class TimeoutCmd extends CommandSet {
  _register (as) {
    as(this.commands, 'timeouts', {perms: 2})
  }
  _boot () {
    this.commands = [
      new Command({
        regex: /list timeouts/,
        usage: 'list timeouts',
        help: 'Lists all currently active timeouts.',
        callback: async (message, matches) => {
          const timeouts = await this.medkit.Moderation.Timeouts.getTimeouts({ SC: message.SC })

          if (timeouts.length === 0) {
            message.reply('No timeouts.')
            return
          }

          const list = timeouts.map(t => `> <@${t.user_id}>\n- Timed out by <@${t.mod_user_id}>\n- Reason: ${t.reason || '*none given*'}\n- Timed out for ${moment.duration(t.duration, 'ms').humanize()}\n- Expires at ${moment(t.end_time).tz('UTC').format('MMMM Do YYYY, h:mm:ss a')}`).join('\n---\n')
          
          message.reply(`Current timeouts:\n${list}`)
        }
      }),
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
            message.SC.llc(`**TIMEOUT:**\n- Moderator: <@${message.UC.U.id}>\n- User: <@${user.id}>\n- Duration: ${durationHuman} (${Math.floor(duration / 1000)} seconds)\n- Reason: ${matches[2] || '*none given*'}`)
          })
        },
        sources: ['text']
      }),
      new Command({
        regex: /untimeout <?@?!?([0-9]+)>?/,
        usage: 'untimeout <mention>',
        help: 'Reverses a timeout.',
        callback: async (message, matches) => {
          await this.medkit.Moderation.Timeouts.removeTimeout({SC: message.SC, userId: matches[0], modId: message.UC.id})
          message.reply(`<@${matches[0]}>'s timeout has been lifted.`)
        },
        sources: ['text']
      })
    ]
  }
}

module.exports = TimeoutCmd

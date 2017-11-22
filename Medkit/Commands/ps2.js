const CommandSet = require('./CommandSet')
const Command = require('./Command')

/// /
// Root-level commands
class BasicCmd extends CommandSet {
  _register (as) {
    as(this.commands, 'ps2', {perms: 3})
  }
  _boot () {
    this.commands = [
      new Command({
        regex: /server ([a-zA-Z0-9]+)/,
        usage: 'server <server name>',
        silentAck: true,
        help: 'Gives you a role based on your server of choice.\nIf it succeeded, your message will disappear.',
        callback: (message, matches) => {
          matches[0] = matches[0].toLowerCase()

          if (message.SC.roles[`ps2:${matches[0]}`] !== undefined) {
            message.UC.GM.addRole(message.SC.roles[`ps2:${matches[0]}`])
          } else {
            message.reply("I dunno that server.\n*If you're from PS4, just use `PS4`.*")
            return false
          }
        },
        sources: ['text']
      }),
      new Command({
        regex: /remove server ([a-zA-Z0-9]+)/,
        usage: 'remove server <server name>',
        silentAck: true,
        help: 'Removes a server role.',
        callback: (message, matches) => {
          matches[0] = matches[0].toLowerCase()

          if (message.SC.roles[`ps2:${matches[0]}`] !== undefined) {
            message.UC.GM.removeRole(message.SC.roles[`ps2:${matches[0]}`])
          } else {
            message.reply("I dunno that server.\n*If you're from PS4, just use `PS4`.*")
            return false
          }
        },
        sources: ['text']
      })
    ]
  }
}

module.exports = BasicCmd

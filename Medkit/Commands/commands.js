const CommandSet = require('../CommandSet')
const Command = require('../Command')

/// /
// Custom commands for individual servers.
class CommandCmd extends CommandSet {
  _register (as) {
    as(this.commands, 'commands', {perms: 2})
  }
  _boot () {
    this.commands = [
      new Command({
        regex: /(\bset|add\b) command [-!*]?([A-Za-z0-9_:-]+) ([\s\S]+)/m,
        usage: 'set command <name> <output>',
        help: 'Sets a custom command.',
        callback: (message, matches) => {
          console.log(matches)
          if (matches[1] === 'commands') {
            message.reply('❌ You can\'t use `commands` as a command, silly.')
            return
          }

          message.SC.setCommand(matches[1].toLowerCase(), matches[2]).then((isnew) => {
            if (isnew) {
              message.reply('Command added.')
            } else {
              message.reply('Command modified.')
            }
          })
        },
        sources: ['text']
      }),
      new Command({
        regex: /(\bremove|delete|del|rm\b) command ([A-Za-z0-9_:-]+)/,
        usage: 'remove command <name>',
        help: 'Removes a custom command.',
        callback: (message, matches) => {
          message.SC.rmCommand(matches[1].toLowerCase()).then((existed) => {
            if (existed) {
              message.reply('Command removed.')
            } else {
              message.reply('Command not found.')
            }
          })
        },
        sources: ['text']
      })
    ]
  }
}

module.exports = CommandCmd

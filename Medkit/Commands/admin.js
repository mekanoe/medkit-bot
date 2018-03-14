const CommandSet = require('../CommandSet')
const Command = require('../Command')

/// /
// Root-level commands
class AdminCmd extends CommandSet {
  _register (as) {
    as(this.commands, 'admin', {perms: 1})
  }
  _boot () {
    this.commands = [
      new Command({
        regex: /create vanity roles? (.+)/,
        help: 'Creates one or more roles with no permissions',
        callback: async (message, matches) => {
          const roles = matches[0].split(',').map(x => x.trim())
          for (let r of roles) {
            let color
            if (r.indexOf('#') !== -1) {
              const rs = r.split('#')
              r = rs[0].trim()
              color = `#${rs[1]}`
            }

            await message.SC.S.createRole({ name: r, permissions: 0, color })
          }

          message.reply(`👍 Woo! Created role${(roles.length > 1) ? 's' : ''} ${matches[0]}.`)
        }
      }),
      new Command({
        regex: /add role ([a-z0-9_:-]+) (.+)/,
        usage: 'add role <type> <name>',
        help: 'Adds a role for use by anything.',
        callback: async (message, matches) => {
          try {
            await message.SC.addRole(matches[0], matches[1])
            message.reply(`Added role ${matches[1]} as ${matches[0]}`)
          } catch (err) {
            if (err.message === 'role not found') {
              message.reply("I can't find that role.")
            } else {
              throw err
            }
          }
        },
        sources: ['text']
      }),
      new Command({
        regex: /set log channel/,
        usage: 'set log channel',
        help: 'Sets this channel as the log channel.',
        callback: async (message, matches) => {
          let channelId = message.M.channel.id
          await message.SC.setLogChannel(channelId)
          message.reply("I'll report to this channel!")
        },
        sources: ['text']
      })
    ]
  }
}

module.exports = AdminCmd
